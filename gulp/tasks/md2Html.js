/**
 * process md file
 * @param gulp
 * @param Plugins
 * @param config
 */
module.exports=function (gulp, Plugins, config) {

    const TaskName=config.TaskName,
        docRoot=config.DocPath_src,
        docOutRoot=`${config.RootPath}${config.Mode.Release}/docs`,
        docTemplateAttachPath=`${config.DocTemplatePath}/attachfiles`,
        docImgPath=`${docRoot}/images/`,
        docImgOutPath=`${docOutRoot}/images`,
        docImgRevName='rev-release-docImg.json',
        docImgRevPath=`${config.PreBuildPath}/rev/${docImgRevName}`,
        docCssPath=`${docRoot}`,
        docCssOutPath=`${docOutRoot}`,
        docCssRevName='rev-release-docCss.json',
        docCssRevPath=`${config.PreBuildPath}/rev/${docCssRevName}`,
        MagicOpts=config.MagicMd2HtmlOpts,
        extraStylePath=MagicOpts.ExtraStylePath,
        Tools=require('../tools')(gulp, Plugins);
    let realExtraStylePath=extraStylePath;

    /**
     * 生成doc的css
     */
    gulp.task(TaskName.BuildDocCss,function () {
        let docLessPath=`${config.LessPath}/doc.less`;
        return Tools.buildCss(docLessPath,null, { path:docCssPath });
    });

    /**
     * 压缩doc中使用的的图片
     */
    gulp.task(TaskName.MinDocImg,function () {
        return gulp.src(`${docImgPath}/**/*`)
            .pipe(Plugins.rev())
            .pipe(Plugins.imagemin())
            .pipe(gulp.dest(docImgOutPath))
            .pipe(Plugins.rev.manifest())
            .pipe(Plugins.rename(docImgRevName))
            .pipe(gulp.dest(config.PreBuildPath+'/rev'))
            .pipe(Plugins.notify({
                message: 'Minify doc images completed!'
            }));
    });

    /**
     * 压缩doc使用的css
     */
    gulp.task(TaskName.MinDocCss,[TaskName.BuildDocCss],function () {
        return gulp.src(`${docCssPath}/*.css`)
            .pipe(Plugins.rev())
            .pipe(Plugins.cleanCss())
            .pipe(gulp.dest(docCssOutPath))
            .pipe(Plugins.rev.manifest())
            .pipe(Plugins.rename(docCssRevName))
            .pipe(gulp.dest(config.PreBuildPath+'/rev'))
            .pipe(Plugins.notify({
                message: 'Minify doc css completed!'
            }));
    });

    /**
     * 将css模板中的css文件名替换成带版本号的文件名
     */
    gulp.task(TaskName.CollectDocCssTemplate,[TaskName.MinDocCss],function () {
        // 1. 先修改模板内的文件名称，可避免逐个文件修改
        realExtraStylePath=`${config.PreBuildPath}/docs`;
        return gulp.src([docCssRevPath, `${docTemplateAttachPath}/css.template`])
            .pipe(Plugins.revCollector({
                replaceReved: true,
            }))
            .pipe(gulp.dest(realExtraStylePath));
    });

    /**
     * 转换md文件
     */
    gulp.task(TaskName.Md2Html,[TaskName.CollectDocCssTemplate],function () {
        // 2. 再批量转换md文件
        return gulp.src(`${config.DocPath_src}/**/*.md`)
            .pipe(Plugins.magicMd2html({
                debugMode:false,
                buildTemplate:true,
                enableToC:true,
                templatePath:MagicOpts.OriginalTempPath,
                cssFilePath:`${realExtraStylePath}/css.template`,
                extraScriptPath:MagicOpts.ExtraScriptPath,
                footerPath:MagicOpts.ExtraFooterPath,
                metaInfo:{
                    author:MagicOpts.DefaultAuthor,
                    copyright:MagicOpts.Copyright
                },
                markedOptions:{
                    // renderer:config.PluginCfg.render
                }
            }))
            .pipe(Plugins.rename({
                extname: ".html"
            }))
            .pipe(gulp.dest(`${docOutRoot}`))
            .pipe(Plugins.notify({
                message: 'Transform markdown file completed!'
            }));
    });

    /**
     * 因为是多级目录，因此需要递归处理html文件中的img文件名
     */
    gulp.task(TaskName.BuildDoc,[TaskName.Md2Html,TaskName.MinDocImg],function () {

        const processViews=function (parentDir) {


        };


        return gulp.src([docCssRevPath,docImgRevPath,`${docOutRoot}/**/*.html`])
            .pipe(Plugins.revCollector({
                replaceReved: true,
            }))
            .pipe(gulp.dest(docOutRoot));
    });

};