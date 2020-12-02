module.exports= function (gulp, Plugins) {

    const PluginName='gulp-auto-build';

    const INNER={
        getCurrentRoot:function(config){
            return `${config.RootPath}${config.CurrentMode}`;
        },
        getPathByMode:function(config,type=''){
            let path;
            if(config){
                let suffix='',
                    ResType=config.ResourceType;
                switch (type){
                    case ResType.JS:
                        suffix='app';
                        break;
                    case ResType.CSS:
                    case ResType.Views:
                    case ResType.Vendor:
                    case ResType.DOCS:
                        suffix=type;
                        break;
                    case ResType.IMG:
                    case ResType.Fonts:
                    case ResType.Datas:
                    default:
                        suffix=`assets/${type}`;
                        break;
                }
                path=`${config.RootPath}${config.CurrentMode}/${suffix}`;
            }else{
                path=__dirname;
            }
            return path;
        },
        getRevFileName:function(config,type=''){
            return `rev-${config.CurrentMode}-${type}.json`;
        },
        getRevFilePath:function(config,type=''){
            return `${config.PreBuildPath}/rev/${INNER.getRevFileName(config,type)}`;
        },
        /**
         * 获取指定目录下的子目录
         * @param dir
         * @returns {*}
         */
        getFolders:function(dir){
            return Plugins.fs.readdirSync(dir)
                .filter(function(file) {
                    return Plugins.fs.statSync(Plugins.path.join(dir, file)).isDirectory();
                });
        },
        /**
         * 使用指定方法对文件内容进行过滤
         * @param modifier
         * @returns {*}
         */
        replaceContent:function (modifier) {
            if(modifier!==undefined && typeof modifier !=='function')
                return this;
            else
                return Plugins.through2.obj((file,encoding,cb)=>{
                    let ori_content=String(file.contents),
                        transformed=modifier(ori_content);
                    file.contents=Buffer.from(transformed);

                    cb(null,file);
                });
        },
        /**
         * babel es6
         * @param source
         * @param excludes
         * @param output
         * @param mode
         * @returns {*}
         */
        babelJS:function (source='', excludes=[], output={},mode='amd',minify=false) {
            let localSource=[],
                localExcludes=[];
            if(typeof source ==='string'){
                localSource.push(source);
            }else if(Array.isArray(source)){
                localSource=[].concat(source);
            }
            if(localSource.length && output && output.path && mode){
                if(excludes!==undefined && Array.isArray(excludes)){
                    excludes.forEach((item)=>{
                        localExcludes.push('!'+item);
                    });
                    if(localExcludes.length){
                        localSource=localSource.concat(localExcludes);
                    }
                }
                let babelPresets=[[ "env", {
                    "targets": {
                        "browsers": [
                            "last 2 versions",
                            "safari >= 7"
                        ]
                    },
                    "modules": mode,
                    "useBuiltIns": "usage",
                    "debug": false
                } ]];
                if(minify){
                    babelPresets.push(["minify", {
                        keepFnName: true,
                        keepClassName:false,
                    }]);
                }
                return gulp.src(localSource)
                    .pipe(Plugins.babel({
                        presets: babelPresets
                    }))
                    .pipe(gulp.dest(output.path));
            }else{
                return new Plugins.PluginError(PluginName,'Babel JS Error: Config is wrong!');
            }
        },
        getThemeLessTask:function (lessDir,outputDir,themeRex) {
            if(!themeRex){
                themeRex=/theme-\w*[.]less/;
            }
            let files=Plugins.fs.readdirSync(lessDir).filter(function(file) {
                let flag=false;
                if(themeRex.test(file) &&
                    Plugins.fs.statSync(Plugins.path.join(lessDir, file)).isFile()){
                    flag=true;
                }
                return flag;
            });
            return files.map((fname)=>{
                let f=Plugins.path.join(lessDir,fname)/*,
                    name=fname.substring(0,fname.indexOf('.less'))*/;
                return INNER.buildCss(f,null, { path:outputDir });
            });
        },
        /**
         * 构建 项目多主题样式
         * @param themeRex
         * @param lessDir
         * @param outputDir
         * @returns {*}
         */
        buildThemes:function(lessDir,outputDir,themeRex){
            let projectTask=INNER.getThemeLessTask(lessDir,outputDir,themeRex);
            return Plugins.merge2(projectTask);
        },
        buildCss:function(source='', excludes=[], output={}){
            let localSource=[],
                localExcludes=[];
            if(typeof source ==='string'){
                localSource.push(source);
            }else if(Array.isArray(source)){
                localSource=[].concat(source);
            }
            if(localSource.length && output && output.path ){
                if(excludes!==undefined && Array.isArray(excludes)){
                    excludes.forEach((item)=>{
                        localExcludes.push('!'+item);
                    });
                    if(localExcludes.length){
                        localSource=localSource.concat(localExcludes);
                    }
                }
                return gulp.src(localSource)
                    .pipe(Plugins.less())
                    .pipe(Plugins.autoprefixer({
                        browsers: ['cover 99.5%','not dead'],
                        cascade: false,
                        remove:false
                    }))
                    .pipe(gulp.dest(output.path));
            }else{
                return new Plugins.PluginError(PluginName,'Build CSS Error: Config is wrong!');
            }
        },
        /**
         * copy all file in vendor dir
         */
        copyFiles:function (from='', to='', excludes=[]) {
            let localSource=[],
                localExcludes=[];
            if(typeof from ==='string'){
                localSource.push(from);
            }else if(Array.isArray(from)){
                localSource=[].concat(from);
            }
            if(localSource.length && to){
                if(excludes!==undefined && Array.isArray(excludes)){
                    excludes.forEach((item)=>{
                        localExcludes.push('!'+item);
                    });
                    if(localExcludes.length){
                        localSource=localSource.concat(localExcludes);
                    }
                }
                return gulp.src(localSource)
                    .pipe(gulp.dest(to));
            }else{
                return new Plugins.PluginError(PluginName,'Copy Error: Config is wrong!');
            }
        },
        camelCaseName:function (str) {
            let res='';
            if(str && typeof str ==='string' && str.trim()){
                let parts=str.toLowerCase().split('-');
                for (let i=0;i<parts.length;i++ ){
                    if(!i){
                        res+=parts[i];
                    }else{
                        res+=Plugins._.upperFirst(parts[i]);
                    }
                }
            }
            return res;
        }
    };



    return Object.assign({},INNER);
};