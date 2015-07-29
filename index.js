'use strict';

var fs          = require('fs');
var path        = require('path');
var esprima     = require('esprima');
var escodegen   = require('escodegen');
var htmlclean   = require('htmlclean');
var through     = require('through2');
var gutil       = require('gulp-util');

var PluginError = gutil.PluginError;

// Consts
var PLUGIN_NAME = 'gulp-name-amd';
    
function isCallExp( exp , methodName ){

    if( exp.type == 'CallExpression' ){

        var callee = exp.callee;
        if( typeof methodName == 'undefined' ){

            return callee.type == 'Identifier';
        }
        else{

            return callee.type == 'Identifier' && callee.name == methodName
        }
    }

    return false;
};

function buildLiteralExp ( value ){
        
    return {
                "type": "Literal",
                "value": "$1".replace( '$1', value ),
                "raw": "'$1'".replace( '$1', value )
            }
};

function logError ( msg ){
    
    gutil.log( gutil.colors.red( PLUGIN_NAME + ':' ), msg );
}

function logInfo ( msg ){
	
    gutil.log( gutil.colors.yellow( PLUGIN_NAME + ': '+msg ) );
}

function log( msg ){
	
	gutil.log(  PLUGIN_NAME + ':' , msg );
}

// Plugin level function(dealing with files)
function gulpNameAmd( options ) {
    
    log( 'Starting ' + gutil.colors.magenta( "'name AMD module'") + ' ...' );
    
    return through.obj(function( file, encoding, callback ) {
    
        
        if ( file.isNull() || file.isDirectory() ) {
            
            return callback( null, file );
        }

        if ( file.isStream() ) {

            return callback(new gutil.PluginError( PLUGIN_NAME, 'Streaming not supported') );
        }
        
        var filePath = file.history[0];
        var fileName = path.basename( filePath );
        var viewName = path.basename( filePath, '.js' );
        var logName  = gutil.colors.magenta( fileName );
        var code     = file.contents.toString();
        var ast      = esprima.parse( code );

        if( ast.body[0].type != 'ExpressionStatement'  ){
            logError( 'module must begin with define call ' +  logName );
            return;
        }
        
        // 找到define 函数调用
        var defineExp = ast.body[0].expression;
        if( !isCallExp( defineExp , 'define' ) ){
            logError( 'cannot find define call in ' +  logName );
            return;
        }
        
        var defineArgs = defineExp.arguments;
        var nameArg = defineArgs[ 0 ];
        
        if ( defineArgs.length > 1 && nameArg && nameArg.type != 'Literal' ){
        
            log( 'naming ' + fileName );

            defineExp.arguments.unshift(
                buildLiteralExp( viewName )
            );

            file.contents =  new Buffer( escodegen.generate( ast , {
                format: {
                    escapeless: true,
                }
            }));
          
        }
        else{
            
            logInfo( 'skip ' + fileName );
        }
        
        callback( null, file );
        
    });
}

// Exporting the plugin main function
module.exports = gulpNameAmd;