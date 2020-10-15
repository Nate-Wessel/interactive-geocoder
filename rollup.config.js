import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from 'rollup-plugin-json';
import terser from "rollup-plugin-terser";

export default {
	input: 'main.js',
	output: [ 
		{
			file: 'bundle.js',
		},{
			file: 'bundle.min.js',
			plugins: [ terser.terser() ]
		}
	],
	plugins: [ resolve(), commonjs(), json() ],
	onwarn: function (warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
		warn(warning);
	}
};
