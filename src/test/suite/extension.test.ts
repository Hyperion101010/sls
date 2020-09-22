import * as assert from 'assert';

import * as vscode from 'vscode';
import { getDocUri, activate, doc, getedits } from './helper';
import { get } from 'http';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

suite('Extension Test Suite', function () {
	vscode.window.showInformationMessage('Start all tests.');

	const docUri = getDocUri('applyedits.sol');

	this.timeout(20000);
	test('Testing for apply edit', async () => {
		await testcommand(docUri);
	});

	this.timeout(20000);
	const diagnosdoc1 = getDocUri('one.sol');
	test('Testing for Row and Col pos.', async () => {
		await testdiagnos(diagnosdoc1, [
			{ message: 'unrecognised token `dddddddddddd\', expected "abstract", "contract", "enum", "event", "import", "interface", "library", "pragma", "struct", DocComment', range: toRange(2,4,2,16), severity: vscode.DiagnosticSeverity.Error, source: 'solidity'}
		]	
		);
	});

	this.timeout(20000);
	const diagnosdoc2 = getDocUri('two.sol');
	test('Testing for diagnostic errors.', async () => {
		await testdiagnos(diagnosdoc2, [
			{ message: 'unrecognised token `}\', expected "!", "(", "+", "++", "-", "--", "[", "address", "bool", "bytes", "delete", "false", "mapping", "new", "payable", "string", "this", "true", "~", Bytes, Int, LexHexLiteral, LexHexNumber, LexIdentifier, LexNumber, LexStringLiteral, Uint',
			range: toRange(13,1,13,2), severity: vscode.DiagnosticSeverity.Error, source: 'solidity'}
		]
		);
	});

	this.timeout(20000);
	const diagnosdoc3 = getDocUri('three.sol');
	test('Testing for diagnostic info.', async () => {
		await testdiagnos(diagnosdoc3,	[
		]);
	});

	this.timeout(20000);
	const diagnosdoc4 = getDocUri('four.sol');
	test('Testing for diagnostics warnings.', async () => {
		await testdiagnos(diagnosdoc4, [
			{ message: 'unknown pragma ‘foo’ with value ‘bar’ ignored', range: toRange(0,7,0,14), severity: vscode.DiagnosticSeverity.Warning, source: `solidity`},
			{ message: 'function declared ‘nonpayable’ can be declared ‘pure’', range: toRange(3,5,5,6), severity: vscode.DiagnosticSeverity.Warning, source: `solidity`},
		]);
	});

	// Tests for hover.
	this.timeout(20000);
	const hoverdoc1 = getDocUri('hover1.sol');
	test('Testing for Hover.', async () => {
		await testhover(hoverdoc1);
	});
});

function toRange(lineno1: number, charno1: number, lineno2: number, charno2: number){
	const start = new vscode.Position(lineno1, charno1);
	const end = new vscode.Position(lineno2, charno2);
	return new vscode.Range(start, end);
}

async function testhover(docUri: vscode.Uri){
	await activate(docUri);

	var pos1 = new vscode.Position(14, 39);

	let actualhover = await vscode.commands.executeCommand('vscode.executeHoverProvider', docUri, pos1) as vscode.Hover[];

	let contentarr1 = actualhover[0].contents as vscode.MarkdownString[];

	assert.equal( contentarr1[0].value, 'mapping(address => uint256) pendingReturns');

	var pos2 = new vscode.Position(36, 36);

	let actualhover2 = await vscode.commands.executeCommand('vscode.executeHoverProvider', docUri, pos2) as vscode.Hover[];

	let contentarr2 = actualhover2[0].contents as vscode.MarkdownString[];

	assert.equal( contentarr2[0].value, 'Either the code is incorrect or Feature not yet implemented for 0 offset');

	var pos3 = new vscode.Position(77, 15);

	let actualhover3 = await vscode.commands.executeCommand('vscode.executeHoverProvider', docUri, pos3) as vscode.Hover[];

	let contentarr3 = actualhover3[0].contents as vscode.MarkdownString[];

	assert.equal( contentarr3[0].value, '(uint256 storage)');
}

async function testdiagnos(docUri: vscode.Uri, expecteddiag: vscode.Diagnostic[]){
	await activate(docUri);

	let actualDiagnostics = vscode.languages.getDiagnostics(docUri);

	if(actualDiagnostics){
	expecteddiag.forEach((expectedDiagnostic, i) => {
		const actualDiagnostic = actualDiagnostics[i];
		assert.equal(actualDiagnostic.message, expectedDiagnostic.message);
		assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range);
		assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity);
	});
	}
	else{
		console.error('the diagnostics are incorrect', actualDiagnostics);
	}
}

async function testcommand(docUri: vscode.Uri){
	
	await activate(docUri);

	let val = await vscode.commands.executeCommand('slang-ex.applyedit');

	let res = await getedits();

	if(res){
		assert.equal(res.text, '42');
	}
	else{
		console.error('failed to initialize apply edit');
	}
}