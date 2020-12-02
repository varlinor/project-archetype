module.exports=function (gulp, Plugins, config) {
    const TaskName=config.TaskName,
        ResourceType=config.ResourceType,
        PackFormat=config.PackFormat,
        Tools=require('../tools')(gulp, Plugins);

    /**
     * 清除所有debug、prebuild、release目录
     */
    gulp.task(TaskName.CleanAll,[TaskName.CleanPreBuild],function (cb) {
        let debugPath=`${config.RootPath}${config.Mode.Debug}/*`,
            releasePath=`${config.RootPath}${config.Mode.Release}/*`;
        return Plugins.del(debugPath,releasePath ,cb);
    });

    /**
     * 清理prebuild
     */
    gulp.task(TaskName.CleanPreBuild,function (cb) {
        return Plugins.del(`${config.PreBuildPath}/*`,cb);
    });

    /**
     * 清理current mode 对应的debug/release目录
     */
    gulp.task(TaskName.CleanCurrent,function (cb) {
        let path=`${Tools.getCurrentRoot(config)}/*`;
        return Plugins.del([`${config.PreBuildPath}/*`,path] ,cb);
    });

    /**
     * 生成主题风格
     */
    gulp.task(TaskName.BuildTheme,function () {
        return Tools.buildThemes(config.LessPath,
            config.SrcPath+'/css/',/theme-\w*[.]less/);
    });

    /**
     * 压缩图片，并追加版本号
     */
    gulp.task(TaskName.MinImg,function () {
        return gulp.src(`${config.AssetsPath_src}/images/*`)
            .pipe(Plugins.rev())
            .pipe(Plugins.imagemin())
            .pipe(gulp.dest(Tools.getPathByMode(config,ResourceType.IMG)))
            .pipe(Plugins.rev.manifest())
            .pipe(Plugins.rename(Tools.getRevFileName(config,ResourceType.IMG)))
            .pipe(gulp.dest(config.PreBuildPath+'/rev'))
            .pipe(Plugins.if(!config.isDebug,Plugins.notify({
                message: 'Minify images completed!'
            })));
    });

    /**
     * 压缩css，并追加版本号
     */
    gulp.task(TaskName.MinCss,[TaskName.BuildTheme],function () {

        return gulp.src(`${config.CssPath_src}/*.css`)
            .pipe(Plugins.rev())
            .pipe(Plugins.if(!config.isDebug,Plugins.cleanCss()))
            .pipe(gulp.dest(Tools.getPathByMode(config,ResourceType.CSS)))
            .pipe(Plugins.rev.manifest())
            .pipe(Plugins.rename(Tools.getRevFileName(config,ResourceType.CSS)))
            .pipe(gulp.dest(config.PreBuildPath+'/rev'))
            .pipe(Plugins.if(!config.isDebug,Plugins.notify({
                message: 'Minify css completed!'
            })));
    });

    /**
     * 字体文件追加版本号
     */
    gulp.task(TaskName.RevFonts,function () {
        return gulp.src(`${config.AssetsPath_src}/fonts/*`)
            .pipe(Plugins.rev())
            .pipe(gulp.dest(Tools.getPathByMode(config,ResourceType.Fonts)))
            .pipe(Plugins.rev.manifest())
            .pipe(Plugins.rename(Tools.getRevFileName(config,ResourceType.Fonts)))
            .pipe(gulp.dest(config.PreBuildPath+'/rev'))
            .pipe(Plugins.if(!config.isDebug,Plugins.notify({
                message: 'rev fonts completed!'
            })));
    });

    /**
     * 数据文件追加版本号
     */
    gulp.task(TaskName.RevDatas,function () {
        return gulp.src(`${config.AssetsPath_src}/datas/*`)
            .pipe(Plugins.rev())
            .pipe(gulp.dest(Tools.getPathByMode(config,ResourceType.Fonts)))
            .pipe(Plugins.rev.manifest())
            .pipe(Plugins.rename(Tools.getRevFileName(config,ResourceType.Fonts)))
            .pipe(gulp.dest(config.PreBuildPath+'/rev'))
            .pipe(Plugins.if(!config.isDebug,Plugins.notify({
                message: 'rev fonts completed!'
            })));
    });

    /**
     * 复制第三方依赖
     */
    gulp.task(TaskName.CopyVendors,function(){
        return Tools.copyFiles(
            config.SrcPath+'/vendor/**/*',
            Tools.getPathByMode(config,ResourceType.Vendor));
    });

    /**
     * 复制编写的页面
     */
    gulp.task(TaskName.CopyViews,function(){
        return Tools.copyFiles(
            config.SrcPath+'/views/**/*',
            Tools.getPathByMode(config,ResourceType.Views));
    });

    /**
     * 修正css中引入的img、fonts等文件的后缀
     */
    gulp.task(TaskName.CollectCss,[TaskName.MinCss,TaskName.MinImg,TaskName.RevFonts],function () {
        let revFonts=Tools.getRevFilePath(config,ResourceType.Fonts),
            revImg=Tools.getRevFilePath(config,ResourceType.IMG),
            cssPath=Tools.getPathByMode(config,ResourceType.CSS);
        return gulp.src([revFonts,revImg,`${cssPath}/**/*.css`])
            .pipe(Plugins.revCollector({
                replaceReved: true,
        /*dirReplacements: {
            'css': '/dist/css',
                '/js/': '/dist/js/',
                'cdn/': function(manifest_value) {
                return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
            }
        }*/
            }))
            .pipe(gulp.dest(cssPath))
            .pipe(Plugins.if(!config.isDebug,Plugins.notify({
                message: 'Collect css completed!'
            })));
    });

    /**
     * 修正js中引入的datas、img文件的后缀
     */
    gulp.task(TaskName.CollectJS,[TaskName.BuildJS],function () {
        let revDatas=Tools.getRevFilePath(config,ResourceType.Datas),
            revImg=Tools.getRevFilePath(config,ResourceType.IMG),
            jsPath=Tools.getPathByMode(config,ResourceType.JS);
        return gulp.src([revDatas,revImg,`${jsPath}/**/*.js`])
            .pipe(Plugins.revCollector({
                replaceReved: true,
            }))
            .pipe(gulp.dest(jsPath))
            .pipe(Plugins.if(!config.isDebug,Plugins.notify({
                message: 'Collect javascript completed!'
            })));
    });

    /**
     * 修正html中引入的css、js、datas、img文件后缀
     */
    gulp.task(TaskName.CollectView,[TaskName.CollectCss,TaskName.CollectJS],function () {
        let revCss=Tools.getRevFilePath(config,ResourceType.CSS),
            revJS=Tools.getRevFilePath(config,ResourceType.JS),
            revDatas=Tools.getRevFilePath(config,ResourceType.Datas),
            revImg=Tools.getRevFilePath(config,ResourceType.IMG),
            viewPath=Tools.getPathByMode(config,ResourceType.Views);
        return gulp.src([revCss,revDatas,revImg,revJS,`${viewPath}/**/*.html`])
            .pipe(Plugins.revCollector({
                replaceReved: true,
            }))
            .pipe(Tools.replaceContent((content)=>{
                return content.replace(/app\-es6\//g,'app/');
            }))
            .pipe(gulp.dest(viewPath))
            .pipe(Plugins.if(!config.isDebug,Plugins.notify({
                message: 'Collect view completed!'
            })));
    });


    /**
     * 修正css、js、html中的fonts、datas、img等文件的后缀
     */
    gulp.task(TaskName.CollectResources,[TaskName.CollectView]);


    gulp.task(TaskName.BuildJS,function () {
        let outJSPath=Tools.getPathByMode(config,ResourceType.JS);
        return Tools.babelJS(config.AppPath_ES_src+'/**/*.js',
            [config.AppPath_src+'/plugins/*.*',
             config.AppPath_ES_src+'/views/*'],
            {
                path:outJSPath
            },PackFormat.UMD,false);
    });

    gulp.task(TaskName.BuildJSEntry,function () {
        let entryPath=`${config.AppPath_ES_src}/views/**/*.js`,
            outJSPath=`${Tools.getPathByMode(config,ResourceType.JS)}/views`,
            entryTask=Tools.babelJS(entryPath, null, { path:outJSPath },PackFormat.AMD,false),
            cfgOutPath=Tools.getCurrentRoot(config),
            requireTask=Tools.copyFiles(`${config.SrcPath}/require.config.js`,cfgOutPath);
        return Plugins.merge2([entryTask,requireTask]);
    });

    gulp.task(TaskName.CollectJSEntry,[TaskName.BuildJSEntry],function () {
        let curEntryPath=`${Tools.getPathByMode(config,ResourceType.JS)}/views`;
        return gulp.src(`${curEntryPath}/*.js`)
            .pipe(Tools.replaceContent((content)=>{
                return content.replace(/\.\.\//g,'AppDir/')
                    .replace(/define\(\[/,'require([');
            }))
            .pipe(gulp.dest(curEntryPath))
    });
};