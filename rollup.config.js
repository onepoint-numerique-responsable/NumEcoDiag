import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import { terser } from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import babel from '@rollup/plugin-babel';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev', '--single'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/assets/app.js'
	},
	plugins: [
		svelte({
			compilerOptions: {
				dev: !production,
				css: 'external',
				compatibility: {
					componentApi: 4
				}
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'app.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		// Ajout du plugin babel pour assurer la compatibilité avec les navigateurs cibles
		babel({
			babelHelpers: 'bundled',
			exclude: ['node_modules/@babel/**', 'node_modules/core-js/**'],
			presets: [
				[
					'@babel/preset-env',
					{
						targets: {
							chrome: '80',
							firefox: '72',
							safari: '13.1',
							edge: '80'
						},
						useBuiltIns: 'usage',
						corejs: 3
					}
				]
			]
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	},
	onwarn(warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') return;
		warn(warning);
	}
};
