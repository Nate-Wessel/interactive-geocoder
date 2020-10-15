import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from 'rollup-plugin-json';
import terser from "rollup-plugin-terser";

export default {
	input: 'main.js',
	output: {
		file: 'bundle.js',
		format: 'umd'
	},
	plugins: [ resolve(), commonjs(), json(), terser.terser() ],
	onwarn: function (warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
		warn(warning);
	}
};
