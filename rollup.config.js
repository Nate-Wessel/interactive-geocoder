import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from 'rollup-plugin-json';
//import terser from "rollup-plugin-terser";
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';

export default {
	input: 'src/main.js',
	output: [ 
		{
			file: 'dist/bundle.js',
		}
		//,{
		//	file: 'dist/bundle.min.js',
		//	plugins: [ terser.terser() ]
		//}
	],
	plugins: [ 
		resolve(),
		replace({
			'process.env.NODE_ENV': JSON.stringify( 'development' )
		}),
		babel({ 
			exclude: 'node_modules/**',
			presets: ['@babel/env', '@babel/preset-react'],
			babelHelpers: 'bundled'
		}),
		commonjs(),
		json()
	],
	externals: {
		'react': 'React'
	},
	onwarn: function (warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
		warn(warning);
	}
};
