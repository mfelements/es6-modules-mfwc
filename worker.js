function transformImportToRequireAsync({ source, specifiers }){
    const functionBody = [];
    const res = {
        type: 'CallExpression',
        callee: {
            type: 'MemberExpression',
            computed: false,
            object: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'requireAsync',
                },
                arguments: [ source ],
            },
            property: {
                type: 'Identifier',
                name: 'then',
            }
        },
        arguments: [{
            type: 'ArrowFunctionExpression',
            generator: false,
            async: false,
            params: [{ type: 'Identifier', name: 'v' }],
            body: { type: 'BlockStatement', body: functionBody },
            directives: [],
        }]
    };
    for(const specifier of specifiers){
        let value;
        switch(specifier.type){
            case 'ImportNamespaceSpecifier':
                value = {
                    type: 'Identifier',
                    name: 'v',
                };
                break;
            case 'ImportDefaultSpecifier':
                value = {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: 'v',
                    },
                    property: {
                        type: 'Identifier',
                        name: 'default',
                    }
                };
                break;
            case 'ImportSpecifier':
                value = {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: 'v',
                    },
                    property: specifier.imported,
                };
                break;
        };
        functionBody.push({
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: 'Object',
                    },
                    property: {
                        type: 'Identifier',
                        name: 'defineProperty'
                    },
                },
                arguments: [
                    {
                        type: 'Identifier',
                        name: 'context',
                    },
                    {
                        type: 'StringLiteral',
                        value: specifier.local.name,
                    },
                    {
                        type: 'ObjectExpression',
                        properties: [
                            {
                                type: 'ObjectMethod',
                                generator: false,
                                async: false,
                                kind: 'method',
                                key: {
                                    type: 'Identifier',
                                    name: 'get',
                                },
                                computed: false,
                                params: [],
                                body: {
                                    type: 'BlockStatement',
                                    directives: [],
                                    body: [{
                                        type: 'ReturnStatement',
                                        argument: value
                                    }]
                                }
                            },
                            {
                                type: 'ObjectMethod',
                                generator: false,
                                async: false,
                                kind: 'method',
                                key: {
                                    type: 'Identifier',
                                    name: 'set',
                                },
                                computed: false,
                                params: [],
                                body: {
                                    type: 'BlockStatement',
                                    directives: [],
                                    body: []
                                }
                            },
                            {
                                type: 'ObjectProperty',
                                computed: false,
                                shorthand: false,
                                method: false,
                                key: {
                                    type: 'Identifier',
                                    name: 'configurable',
                                },
                                value: {
                                    type: 'BooleanLiteral',
                                    value: false,
                                },
                            },
                        ]
                    }
                ],
            }
        })
    }
    return res
}

Babel.registerPlugin('es6-modules-mfwc-stage0', () => {
    const promiseAllArr = [];
    const eofTrigger = {
        type: 'ExpressionStatement',
        expression: {
            type: 'Identifier',
            name: 'EOF TRIGGER'
        }
    };
    return {
        visitor: {
            Program(path){
                path.node.body.push(eofTrigger)
            },
            ImportDeclaration(path){
                const { parent } = path;
                const file = path.parentPath.parent;
                if(parent.type !== 'Program') throw new SyntaxError('Import statements are only allowed at the top level of module');
                const block = file.program.body;
                block.splice(block.indexOf(path.node), 1);
                promiseAllArr.push(transformImportToRequireAsync(path.node));
            },
            ExpressionStatement(path){
                if(path.node !== eofTrigger) return;
                const { parent } = path,
                    { body } = parent;
                body.splice(body.indexOf(eofTrigger), 1);
                const { ast: transformed } = Babel.transformFromAst(path.hub.file.ast.program, null, {
                    presets: [
                        Babel.availablePresets.es2017,
                    ],
                    plugins: [
                        Babel.availablePlugins['transform-modules-commonjs'],
                    ],
                    ast: true,
                    sourceMaps: false,
                });
                parent.body = [{
                    type: 'WithStatement',
                    object: {
                        type: 'CallExpression',
                        arguments: [],
                        callee: {
                            type: 'CallExpression',
                            callee: {
                                type: 'Identifier',
                                name: 'await',
                            },
                            arguments: [{
                                type: 'ArrowFunctionExpression',
                                generator: false,
                                async: true,
                                params: [],
                                body: {
                                    type: 'BlockStatement',
                                    body: [
                                        {
                                            type: 'VariableDeclaration',
                                            kind: 'const',
                                            declarations: [
                                                {
                                                    type: 'VariableDeclarator',
                                                    id: {
                                                        type: 'Identifier',
                                                        name: 'context',
                                                    },
                                                    init: {
                                                        type: 'CallExpression',
                                                        callee: {
                                                            type: 'MemberExpression',
                                                            computed: false,
                                                            object: {
                                                                type: 'Identifier',
                                                                name: 'Object',
                                                            },
                                                            property: {
                                                                type: 'Identifier',
                                                                name: 'create',
                                                            }
                                                        },
                                                        arguments: [
                                                            {
                                                                type: 'NullLiteral'
                                                            }
                                                        ]
                                                    },
                                                },
                                            ],
                                        },
                                        {
                                            type: 'ExpressionStatement',
                                            expression: {
                                                type: 'AwaitExpression',
                                                argument: {
                                                    type: 'CallExpression',
                                                    callee: {
                                                        type: 'MemberExpression',
                                                        computed: false,
                                                        object: {
                                                            type: 'Identifier',
                                                            name: 'Promise'
                                                        },
                                                        property: {
                                                            type: 'Identifier',
                                                            name: 'all',
                                                        },
                                                    },
                                                    arguments: [
                                                        {
                                                            type: 'ArrayExpression',
                                                            elements: promiseAllArr,
                                                        },
                                                    ],
                                                },
                                            }
                                        },
                                        {
                                            type: 'ReturnStatement',
                                            argument: {
                                                type: 'Identifier',
                                                name: 'context',
                                            },
                                        },
                                    ],
                                    directives: [],
                                }
                            }]
                        }
                    },
                    body: {
                        type: 'BlockStatement',
                        directives: [],
                        body: transformed.program.body,
                    },
                }]
            },
        }
    }
});