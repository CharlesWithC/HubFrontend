// Install @babel/parser, @babel/traverse, @babel/types, and readline-sync
// npm install @babel/parser @babel/traverse @babel/types readline-sync

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const types = require('@babel/types');
const readline = require('readline-sync');
const prettier = require('prettier');

let currentDir = path.join(process.cwd(), "src");
let selectedFile = null;
let importedFiles = [];

function listFilesAndDirs(dir) {
    const items = fs.readdirSync(dir).map(name => {
        if (name.startsWith('.')) {
            return null;
        }
        const fullPath = path.join(dir, name);
        const isDirectory = fs.statSync(fullPath).isDirectory();
        if (!isDirectory && path.extname(name) !== '.js') {
            return null;
        }
        return {
            name: isDirectory ? name + '/' : name,
            isDirectory: isDirectory
        };
    }).filter(Boolean);

    const dirs = items.filter(item => item.isDirectory)
        .map(item => item.name)
        .sort();

    const files = items.filter(item => !item.isDirectory)
        .map(item => item.name)
        .sort();

    return [...dirs, ...files];
}

while (!selectedFile) {
    console.log(`Current directory: ${currentDir}`);
    const filesAndDirs = ['..', ...listFilesAndDirs(currentDir)];
    const index = readline.keyInSelect(filesAndDirs, 'Select a file or directory:');
    if (index === -1) {
        process.exit(0);
    }
    const selected = filesAndDirs[index];
    if (selected === '..') {
        currentDir = path.resolve(currentDir, '..');
    } else {
        const fullPath = path.join(currentDir, selected);
        if (fs.statSync(fullPath).isDirectory()) {
            currentDir = fullPath;
        } else if (!importedFiles.includes(fullPath)) {
            selectedFile = fullPath;
            importedFiles.push(fullPath);
        } else {
            console.log('This file is already imported.');
        }
    }
}

let file = selectedFile;

// Read the JavaScript file
const code = fs.readFileSync(file, 'utf-8');

// Parse the code into an Abstract Syntax Tree (AST)
const ast = parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });

// Read the language file
const languageFile = './src/languages/en.js';
let languageData = require(languageFile).en;

// Listen for SIGINT event
process.on('SIGINT', function () {
    console.log('Exiting...');
    process.exit();
});

// Check if the file already imports useTranslation from react-i18next
let hasImport = false;
traverse(ast, {
    ImportDeclaration(path) {
        if (path.node.source.value === 'react-i18next') {
            for (const specifier of path.node.specifiers) {
                if (types.isImportSpecifier(specifier) && specifier.imported.name === 'useTranslation') {
                    hasImport = true;
                    break;
                }
            }
        }
    },
});

if (!hasImport) {
    // If not, add the import at the top of the file
    const importDeclaration = types.importDeclaration(
        [types.importSpecifier(types.identifier('useTranslation'), types.identifier('useTranslation'))],
        types.stringLiteral('react-i18next')
    );
    ast.program.body.unshift(importDeclaration);

    // Add const { tr } = useTranslation(); at the top of the first function or method in the file
    traverse(ast, {
        FunctionDeclaration(path) {
            path.node.body.body.unshift(
                types.variableDeclaration('const', [
                    types.variableDeclarator(
                        types.objectPattern([types.objectProperty(types.identifier('t'), types.identifier('tr'))]),
                        types.callExpression(types.identifier('useTranslation'), [])
                    ),
                ])
            );
            path.stop();
        },
        ArrowFunctionExpression(path) {
            path.node.body.body.unshift(
                types.variableDeclaration('const', [
                    types.variableDeclarator(
                        types.objectPattern([types.objectProperty(types.identifier('t'), types.identifier('tr'))]),
                        types.callExpression(types.identifier('useTranslation'), [])
                    ),
                ])
            );
            path.stop();
        },
    });
}

try {
    // Traverse the AST
    traverse(ast, {
        JSXText(path) {
            // Found a JSX literal
            const node = path.node;
            const value = node.value.trim();
            if (value && value.length > 1) { // Skip single characters
                console.log(`Found string: ${value}`);

                // Generate a placeholder key
                let placeholderKey = value.toLowerCase()
                    .replace(/ /g, '_')
                    .replace(/[^a-z0-9_]/gi, '')
                    .split("_")
                    .slice(0, 5)
                    .join("_");

                let placeholderKeyInput = readline.question(`Translate "${value}"? "${placeholderKey}"? Quit(q)/Skip (!)/Accept Key (Enter)/Custom Key: `, {
                    defaultInput: placeholderKey
                });

                if (placeholderKeyInput === '!') {
                    // Skip translation
                    return;
                } else if (placeholderKeyInput === "q") {
                    throw new Error('Quit');
                } else {
                    // Replace the JSX literal with a useTranslation call
                    const callExpression = types.callExpression(
                        types.identifier('tr'),
                        [types.stringLiteral(placeholderKeyInput)]
                    );
                    path.replaceWith(types.jsxExpressionContainer(callExpression));

                    // Add the string to the language data
                    languageData[placeholderKeyInput] = value;
                }
            }
        },
    });
} catch (error) {
    if (error.message === 'Quit') {
        console.log('Quit command received, stopping traversal.');
    } else {
        throw error;
    }
}

// Generate the modified code
const generator = require('@babel/generator').default;
let modifiedCode = generator(ast).code;

// Format the code with Prettier
prettier.format(modifiedCode, { parser: "babel", spaces: 4, tabWidth: 4, printWidth: 200 })
    .then(formattedCode => {
        // Write the modified code back to the file
        fs.writeFile(file, formattedCode, err => {
            if (err) throw err;
            console.log('The code file has been saved!');
        });

        // Write the modified language data back to the file
        fs.writeFile(languageFile, 'const en = ' + JSON.stringify(languageData, null, 4) + ';\nexports.en = en;', err => {
            if (err) throw err;
            console.log('The language file has been saved!');
        });
    })
    .catch(err => console.error(err));