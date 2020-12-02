module.exports= function () {
    //  define variables in gulp task
    const RootPath='./';
    let config={};

    config={
        ProductName:'fe-dev',
        ProductAlias:'fedev',
        Version:'1.0.0',
        CurrentMode:'debug',
        isDebug:true,
        RootPath:RootPath,  //  based on gulpfile.js path
        GulpPath:`${RootPath}gulp`,  //   file path for gulp
        TaskFilePath:`${RootPath}gulp/tasks`,  //  gulp task file path

        SrcPath:`${RootPath}fe-dev`,
        PreBuildPath:`${RootPath}prebuild`,  //  before dist，just like less、gulp-rev, etc.

        TmpPath:`${RootPath}tmp`,

        PackFormat:{
            AMD:'amd',
            CJS:'cjs',
            ESM:'esm',
            IIFE:'iife',
            UMD:'umd',
            SYSTEM:'system'
        },

        Mode:{
            Debug:'debug',
            Release:'release'
        },
        ResourceType:{
            CSS:'css',
            JS:'js',
            IMG:'images',
            DOCS:'docs',
            Views:'views',
            Fonts:'fonts',
            Datas:'datas',
            Vendor:'vendor',
        },

    };

    config.AppPath_src=`${config.SrcPath}/app`;
    config.AppPath_ES_src=`${config.SrcPath}/app-es6`;
    config.DocPath_src=`${config.SrcPath}/docs`;
    config.AssetsPath_src=`${config.SrcPath}/assets`;
    config.CssPath_src=`${config.SrcPath}/css`;
    config.LessPath=`${config.SrcPath}/less`;
    config.DocTemplatePath=`${config.DocPath_src}/templates`;

    config.TaskName={
        Default:'default',
        Help:'help',
        Detail:'detail',
        Release:'release',
        Debug:'debug',
        Test:'test',
        Watch:'watch',
        UglyJS:'uglyJS',

        BuildTheme:'build:theme',
        BuildCss:'build:css',
        BuildJS:'build:js',
        BuildJSEntry:'build:jsEntry',
        CollectJSEntry:'collect:jsEntry',
        PackAll:'pack:all',
        PackCore:'pack:core',
        PackPlugins:'pack:plugins',

        MinCss:'min:css',
        MinImg:'min:img',
        RevFonts:'rev:fonts',
        RevDatas:'rev:datas',

        CopyVendors:'copy:vendors',
        CopyViews:'copy:views',
        CollectCss:'collect:css',
        CollectJS:'collect:js',
        CollectView:'collect:view',
        CollectResources:'collect:resources',

        CleanAll:'clean:all',
        CleanPreBuild:'clean:prebuild',
        CleanCurrent:'clean:current',


        Md2Html:'md2html',
        BuildDoc:'build:doc',
        BuildDocCss:'build:docCss',
        MinDocImg:'min:docImg',
        MinDocCss:'min:docCss',
        CollectDocView:'collect:docView',
        CollectDocCssTemplate:'collect:docCssTemplate',

    };

    config.MagicMd2HtmlOpts={
        DefaultAuthor:'shenqiao2012@163.com',
        Copyright:'Resoft © ',
        OriginalTempPath:`${config.DocTemplatePath}/base.template.html`,
        ExtraStylePath:`${config.DocTemplatePath}/attachfiles/css.template`,
        ExtraScriptPath:'',
        ExtraFooterPath:`${config.DocTemplatePath}/attachfiles/footer.template`
    };

    return config;
};