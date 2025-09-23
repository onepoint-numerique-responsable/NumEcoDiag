import prettier from 'eslint-config-prettier';
import js from '@eslint/js';
import { includeIgnoreFile } from '@eslint/compat';
import svelte from 'eslint-plugin-svelte';
import { fileURLToPath } from 'node:url';
import checkFile from 'eslint-plugin-check-file';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default [
	{
		ignores: ['**/*.scss', '**/*.sass', '**/*.css', 'src/app.html']
	},
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		rules: { 'no-undef': 'off' }
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte']
			}
		},
		rules: {
			'svelte/button-has-type': 'error',
			'svelte/no-at-debug-tags': 'error',
			'svelte/no-ignored-unsubscribe': 'error',
			'svelte/no-immutable-reactive-statements': 'error',
			'svelte/no-inline-styles': 'warn',
			'svelte/no-inspect': 'warn',
			'svelte/no-reactive-functions': 'error',
			'svelte/no-reactive-literals': 'error',
			'svelte/no-svelte-internal': 'error',
			'svelte/no-unnecessary-state-wrap': 'error',
			'svelte/no-unused-props': 'warn',
			'svelte/no-unused-svelte-ignore': 'error',
			'svelte/no-useless-children-snippet': 'error',
			'svelte/no-useless-mustaches': 'error',
			'svelte/prefer-const': 'error',
			'svelte/prefer-destructured-store-props': 'error',
			'svelte/prefer-writable-derived': 'error',
			'svelte/require-each-key': 'error',
			'svelte/require-event-dispatcher-types': 'error',
			'svelte/require-optimized-style-attribute': 'warn',
			'svelte/require-stores-init': 'error',
			'svelte/valid-each-key': 'error',

			'svelte/derived-has-same-inputs-outputs': 'error',
			'svelte/first-attribute-linebreak': 'off',
			'svelte/html-closing-bracket-spacing': 'error',
			'svelte/html-quotes': ['error', { prefer: 'double' }],
			'svelte/html-self-closing': ['error', 'void'],
			'svelte/mustache-spacing': 'error',
			'svelte/no-extra-reactive-curlies': 'error',
			'svelte/no-spaces-around-equal-signs-in-attribute': 'error',
			'svelte/prefer-class-directive': 'error',
			'svelte/prefer-style-directive': 'error',
			'svelte/shorthand-attribute': 'error',
			'svelte/shorthand-directive': 'error',
			'svelte/spaced-html-comment': 'error',
			'svelte/no-export-load-in-svelte-module-in-kit-pages': 'off',
			'svelte/no-navigation-without-base': 'off',
			'svelte/valid-prop-names-in-kit-pages': 'off'
		}
	},
	{
		files: ['src/**/*.*'],
		plugins: {
			'check-file': checkFile
		},
		rules: {
			'check-file/filename-naming-convention': [
				'error',
				{
					'**/*.{ts,js}': 'CAMEL_CASE',
					'**/*.svelte': 'PASCAL_CASE',
					'**/*.scss': 'KEBAB_CASE'
				}
			],
			'check-file/folder-naming-convention': [
				'error',
				{
					'src/**/': 'CAMEL_CASE'
				}
			]
		}
	},
	{
		files: ['src/app.d.ts', 'src/demo.spec.ts', 'src/app.html'],
		rules: {
			'check-file/filename-naming-convention': 'off',
			'check-file/folder-naming-convention': 'off'
		}
	}
];
