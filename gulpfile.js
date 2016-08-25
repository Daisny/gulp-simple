var gulp = require('gulp'),
	path = require('path'),
	sass= require('gulp-sass'),
	plumber = require('gulp-plumber'),
	rename = require('gulp-rename'),
	del = require('del'),
	clean = require('gulp-clean'),
	run = require('gulp-sequence'),
	livereload = require('gulp-livereload'),
	webserver = require('gulp-webserver');

var minify = require('gulp-minify'),
	uglify = require('gulp-uglify'),
	minifycss = require('gulp-clean-css'),
	rev = require('gulp-rev'),
	revCollector = require('gulp-rev-collector'),
	vinylPaths = require('vinyl-paths'),
	tinypng = require('gulp-tinypng'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	ora = require('ora'),
	filter = require('gulp-filter'),
	gulpif = require('gulp-if'),
	autoprefixer = require('gulp-autoprefixer');


var buildPath = './build',
	src = './src';

var cssFilter = filter('*.css'),
	jsFilter = filter('*.js');

var type = process.argv[2] || 'dev';

gulp.task('sass', function(){
	return gulp.src(path.join(src, 'sass/*.scss'))
		.pipe(plumber())
		.pipe(autoprefixer({
			browser: '[last 10 version]'
		}))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulp.dest(path.join(src, './css')))
/*		.pipe(livereload());*/
});

gulp.task('watch', function(){

	gulp.watch(path.join(src, 'sass/*.scss'), ['sass']);
});

gulp.task('rev', ['rev-css', 'rev-js']);

gulp.task('replace', function(){
	gulp.src(['./rev/**/*.json', path.join(src, 'index.html')])
		.pipe(revCollector())
		.pipe(gulp.dest(buildPath))
		.on('end', function(){
			del('./rev/**')
		});
});

gulp.task('rev-css', function(){
	return gulp.src(path.join(src, './css/*.css'))
		.pipe(minifycss())
		/*.pipe(rename({
			suffix: '.min'
		}))*/
		.pipe(rev())
		.pipe(gulp.dest(path.join(buildPath, '/css')))
		.pipe(rev.manifest({
			merge: true
		}))
		.pipe(gulp.dest('./rev/css'))
		.on('end', function(){
			
		});
});

gulp.task('rev-js', function(){
	return gulp.src(path.join(src, './js/*.js'))
		/*.pipe(plumber())*/
		/*.pipe(rename({
			suffix: '.min'
		}))*/
		.pipe(uglify())
		.pipe(rev())
		.pipe(gulp.dest(path.join(buildPath, '/js')))
		.pipe(rev.manifest({
			merge: true
		}))
		.pipe(gulp.dest('./rev/js'))
		.on('end', function(){
		});
});

gulp.task('product', function(cb){
	run('clean', 'rev', 'replace', 'imagemin')(cb);
});

gulp.task('move', function(){
	gulp.src([path.join(src, 'images/*')])
		.pipe(gulp.dest(buildPath));
});

gulp.task('imagemin', function(){
	var spinner = new ora('tiny images...');
	spinner.start();

	gulp.src(path.join(src, 'images/*'))
		//.pipe(tinypng('9aksWN8hafcwBuMjdtV_fUh1QsZf5-aC'))
		.pipe(imagemin({
			progressive: true
		}))
		.pipe(gulp.dest(path.join(buildPath, '/images')))
		.on('end', function(){
			spinner.stop();
		});
});

gulp.task('server', function(){
	gulp.src([src])
		.pipe(webserver({
			host: '0.0.0.0',
			livereload: true
		}));
});

gulp.task('pro-server', function(){
	gulp.src(buildPath)
		.pipe(webserver({
			host: '0.0.0.0',
			livereload: true
		}));
});

gulp.task('clean', function(){
	console.log('clean');
	//return del(['./build/**', './rev/**', 'css/*-*.css', 'js/*-*.js'])
	return gulp.src(['./build', './rev'])
			.pipe(vinylPaths(del));
})

gulp.task('default', ['server', 'watch']);