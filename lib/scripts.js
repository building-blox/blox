const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const rollup = require("gulp-better-rollup");
const babel = require("rollup-plugin-babel");
const terser = require("gulp-terser");
const path = require("path");
const fs = require("fs");
const fsPath = require("fs-path");
const fsUtils = require("../util/fs-util");
const constants = require("./constants");


module.exports = {

  /**
   * Process page scripts.
   */
  doScripts: async function (args) {
    args.gulp
      .src(args.source, { allowEmpty: true })
      .pipe(sourcemaps.init())
      .pipe(
        rollup(
          {
            plugins: [babel()],
          },
          {
            format: "cjs",
          }
        )
      )
      .pipe(sourcemaps.write())
      .pipe(concat(`index.min.js`))
      .pipe(terser())
      .pipe(args.gulp.dest(args.dest));
  },
  
  /**
   * Process component scripts.
   * TODO: Add to page-level scripts rather than global. To do this, would probably need to 
   * parse page templates, find imports and use the import path (swap the .njk for .js) then
   * have an import in the page js file of something like: 
   * import '../../../.blox/components/features';
   * This file would be an index file that would import all the components for the features page.
   */
  doComponentScripts: async function (){
    return new Promise(async (resolve) => {
      const dirs = await fsUtils.getDirectories(constants.paths.components);
      let dest = `${constants.paths.moduleScripts}/components.js`;
      let jsString = '';
      for (let i = 0; i < dirs.length; i++) {
        const dir = dirs[i];
        let componentJSPath = `${constants.paths.components}/${dir}/${dir}.js`;
        if (fs.existsSync(componentJSPath)) {
          jsString += `import '${constants.paths.moduleScriptsComponents}/${dir}/${dir}.js';\n`;
      }
      }
      fsPath.writeFile(
        dest,
          jsString,
          function (err) {
            if (err) {
              throw err;
            } else {
              resolve();
            }
          });
    });
  }
};
