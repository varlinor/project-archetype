/**
 * 文件结构说明：
 * 将gulp任务分拆到不同的文件，方便管理，按主题分拆，比如：css、html、主体js、插件js等；
 * 定义全局的gulp变量gulp.config.js，包括路径、任务名称、任务变量等；
 * 默认gulpfile.js作为入口文件，负责载入配置、任务文件、并提供默认的命令输出帮助等任务。
 *
 */

     /*  base require */
const gulp =require('gulp'),
    fs=require('fs'),
     /*  add config for gulp tasks  */
    gulpCfg=require('./gulp/gulp.config')(),
     /* all gulp task name */
    TaskName=gulpCfg.TaskName,
    Mode=gulpCfg.Mode,
     /*  this object contains all plugin by pattern  */
    Plugins=require('gulp-load-plugins')({
        pattern:['gulp-*', 'gulp.*', '@*/gulp{-,.}*',
            'del','run-sequence','amd-optimize','fs',
            'crypto','through2','merge2','rollup','magic-md2html']
    }),
     /*  list all task files  */
    gulpTaskList=fs.readdirSync(gulpCfg.TaskFilePath);
Plugins.fs=fs;
Plugins.crypto=require('crypto');
Plugins._=require('lodash');
Plugins.path = require('path');
Plugins.PluginError=require('plugin-error');


let BuildFactory;

     /*  require all task files in tasks gulp/dir  */
    gulpTaskList.forEach(function (taskFile) {
        /*if(taskFile.indexOf('build')>-1){
            BuildFactory=require(gulpCfg.TaskFilePath+'/'+taskFile)(gulp,Plugins,gulpCfg);
        }else{
            require(gulpCfg.TaskFilePath+'/'+taskFile)(gulp,Plugins,gulpCfg);
        }*/
        require(gulpCfg.TaskFilePath+'/'+taskFile)(gulp,Plugins,gulpCfg);
    });

/**
 * set node_env
 */
let env;

const setCurrentMode=function () {
    if(!process.env.NODE_ENV){
        process.env.NODE_ENV=Mode.Debug;
    }
    gulpCfg.CurrentMode=env=process.env.NODE_ENV;
};

/**
 * 根据不同的mode对项目工程进行构建
 * @param mode
 */
const buildProject=function(mode){
    if(Mode.Release===mode){
        process.env.NODE_ENV=Mode.Release;
        gulpCfg.isDebug=false;
    }else{
        process.env.NODE_ENV=Mode.Debug;
        gulpCfg.isDebug=true;
    }
    setCurrentMode();
    /*Plugins.runSequence(TaskName.CleanCurrent,
        [TaskName.BuildTheme],                                //  在CollectResources中已经完成
        [TaskName.CopyViews,TaskName.CopyVendors],
        [TaskName.MinImg,TaskName.RevFonts,TaskName.MinCss],  //  在CollectResources中已经完成
        TaskName.CollectResources,
        function(){
            console.log(`Finished in mode[${env}]!`);
        });*/
    Plugins.runSequence(TaskName.CleanCurrent,
        [TaskName.CopyViews,TaskName.CopyVendors],
        TaskName.CollectJSEntry,
        TaskName.CollectResources,
        function(){
            console.log(`Finished in mode[${env}]!`);
        });
};
/**
 *  gulp default task
 */
gulp.task(TaskName.Default,['help']);

gulp.task(TaskName.Watch,()=>{
    gulp.watch(gulpCfg.LessPath+'/**/*.less',[TaskName.CollectView]);
    // gulp.watch(gulpCfg.AppRoot_src+'-es6/**/*.js',[TaskName.BabelJS]);
});

/**
 *  gulp help to print main cmd
 */
gulp.task(TaskName.Help,function () {
    const infos=[
            'gulp\t\tcall help',
            'gulp help\t\tprint all command',
            'gulp release\t\tclean release dir and build release version',
            'gulp debug\t\tclean debug dir and build debug version',
            'gulp detail\t\tprint all cmd in auto build'
        ],
        info=infos.join('\n');
    console.log(info);
});

/**
 *  list all cmd in this project
 */
gulp.task(TaskName.Detail,function () {
    let col=5,tmp=[],
        infos=[
            'you can use \'gulp <COMMAND>\' to run tasks!',
            '\tCOMMAND',
        ];
    for(let key in TaskName ){
        tmp.push(TaskName[key]);
        if(tmp.length==col ){
            infos.push('\t'+tmp.join(' , '));
            tmp.length=0;
        }
    }
    if(tmp.length>0){
        infos.push('\t'+tmp.join(' , '));
    }
    console.log(infos.join('\n'));
});


/**
 *
 */
gulp.task(TaskName.Debug,function () {
    buildProject(Mode.Debug);
});

/**
 *  release a new version
 */
gulp.task(TaskName.Release,function () {
    buildProject(Mode.Release);
});


gulp.task(TaskName.Test,function () {
    /* test something */

});