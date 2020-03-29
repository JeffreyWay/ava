'use strict';
const fs = require('fs');
const path = require('path');
const {test} = require('tap');
const execa = require('execa');
const tempy = require('tempy');
const {execCli} = require('../helper/cli');

test('formats errors from ava.config.js', t => {
	execCli(['es2015.js'], {dirname: 'fixture/load-config/throws'}, (err, stdout, stderr) => {
		t.ok(err);

		const lines = stderr.split('\n');
		t.is(lines[0], '');
		t.match(lines[1], /Error loading ava\.config\.js:/);
		t.is(lines[2], '');
		t.match(lines[3], /ava\.config\.js/);
		t.match(lines[4], /foo/);
		t.end();
	});
});

test('pkg-conf(resolve-dir): works as expected when run from the package.json directory', t => {
	execCli(['--verbose'], {dirname: 'fixture/pkg-conf/resolve-dir'}, (err, stdout) => {
		t.ifError(err);
		t.match(stdout, /dir-a-base-1/);
		t.match(stdout, /dir-a-base-2/);
		t.notMatch(stdout, /dir-a-wrapper/);
		t.notMatch(stdout, /dir-a-wrapper/);
		t.end();
	});
});

test('pkg-conf(resolve-dir): resolves tests from the package.json dir if none are specified on cli', t => {
	execCli(['--verbose'], {dirname: 'fixture/pkg-conf/resolve-dir/dir-a-wrapper'}, (err, stdout) => {
		t.ifError(err);
		t.match(stdout, /dir-a-base-1/);
		t.match(stdout, /dir-a-base-2/);
		t.notMatch(stdout, /dir-a-wrapper/);
		t.notMatch(stdout, /dir-a-wrapper/);
		t.end();
	});
});

test('use current working directory if `package.json` is not found', () => {
	const cwd = tempy.directory();
	const testFilePath = path.join(cwd, 'test.js');
	const cliPath = require.resolve('../../cli.js');
	const avaPath = require.resolve('../../');

	fs.writeFileSync(testFilePath, `const test = require(${JSON.stringify(avaPath)});\ntest('test', t => { t.pass(); });`); // eslint-disable-line unicorn/string-content

	return execa(process.execPath, [cliPath], {cwd, env: {AVA_FORCE_CI: 'ci'}});
});
