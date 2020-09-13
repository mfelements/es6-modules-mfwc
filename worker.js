(() => {
    const esModulePrivateProp = '__esModule';

    function transformImportToRequireAsync({ source, specifiers, start, end }){
        const functionBody = [
            {
                type: 'ExpressionStatement',
                expression: {
                    type: 'AssignmentExpression',
                    operator: '=',
                    left: {
                        type: 'Identifier',
                        name: 'v',
                    },
                    right: {
                        type: 'ConditionalExpression',
                        test: {
                            type: 'LogicalExpression',
                            operator: '&&',
                            left: {
                                type: 'Identifier',
                                name: 'v',
                            },
                            right: {
                                type: 'MemberExpression',
                                object: {
                                    type: 'Identifier',
                                    name: 'v',
                                },
                                property: {
                                    type: 'Identifier',
                                    name: esModulePrivateProp,
                                },
                                computed: false,
                            },
                        },
                        consequent: {
                            type: 'Identifier',
                            name: 'v',
                        },
                        alternate: {
                            type: 'ObjectExpression',
                            properties: [{
                                type: 'ObjectProperty',
                                key: {
                                    type: 'Identifier',
                                    name: 'default',
                                },
                                value: {
                                    type: 'Identifier',
                                    name: 'v',
                                },
                            }],
                        },
                    },
                }
            },
            {
                type: 'ExpressionStatement',
                expression: {
                    type: 'UnaryExpression',
                    operator: 'delete',
                    prefix: true,
                    argument: {
                        type: 'MemberExpression',
                        object: {
                            type: 'Identifier',
                            name: 'v',
                        },
                        property: {
                            type: 'Identifier',
                            name: esModulePrivateProp,
                        },
                        computed: false,
                    },
                },
            },
        ];
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
            }],
            start,
            end,
        };
        for(const specifier of specifiers){
            let needCheck = false;
            let value;
            ensureType('Identifier', specifier.local);
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
                    needCheck = true;
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
                    needCheck = true;
                    break;
            };
            if(needCheck) functionBody.push({
                type: 'IfStatement',
                test: {
                    type: 'UnaryExpression',
                    operator: '!',
                    prefix: true,
                    argument: {
                        type: 'BinaryExpression',
                        left: {
                            type: 'StringLiteral',
                            value: value.property.name,
                        },
                        operator: 'in',
                        right: {
                            type: 'Identifier',
                            name: 'v',
                        }
                    }
                },
                consequent: {
                    type: 'ThrowStatement',
                    argument: {
                        type: 'NewExpression',
                        callee: {
                            type: 'Identifier',
                            name: 'ReferenceError',
                        },
                        arguments: [{
                            type: 'StringLiteral',
                            value: start + '@Cannot find export ' + value.property.name + ' in ' + source.value,
                        }],
                    },
                },
            });
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
                                        name: 'enumerable',
                                    },
                                    value: {
                                        type: 'BooleanLiteral',
                                        value: true,
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

    function ensureType(type, ...objects){
        for(const object of objects) if(object.type !== type) throw new TypeError(`Cannot ensure object is of type ${type}`)
    }

    function flatify(arr){
        const r = [];
        for(const item of arr) r.push(...(Array.isArray(item) ? item : [item]));
        return r
    }

    Babel.registerPlugin('es6-modules-mfwc-stage0', (importMetaVariableName, args) => () => {
        let promiseAllArr = [];
        const eofTrigger = {
            type: 'ExpressionStatement',
            expression: {
                type: 'Identifier',
                name: 'EOF TRIGGER'
            }
        };
        let isESM = false;
        return {
            visitor: {
                Program(path){
                    path.node.body.push(eofTrigger)
                },
                ImportDeclaration(path){
                    const { parent } = path;
                    const file = path.parentPath.parent;
                    if(parent.type !== 'Program') throw new SyntaxError('Import statements are only allowed at the top level of module');
                    isESM = true;
                    const block = file.program.body;
                    block.splice(block.indexOf(path.node), 1);
                    promiseAllArr.push(transformImportToRequireAsync(path.node));
                },
                ExportDefaultDeclaration({ node, parent }){
                    if(parent.type !== 'Program') throw new SyntaxError('Export statements are only allowed at the top level of module');
                    isESM = true;
                    const { declaration, start, end } = node;
                    parent.body.unshift({
                        type: 'IfStatement',
                            test: {
                                type: 'BinaryExpression',
                                operator: 'in',
                                left: {
                                    type: 'StringLiteral',
                                    value: 'default',
                                },
                                right: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'module',
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'exports',
                                    },
                                    computed: false,
                                },
                            },
                            consequent: {
                                type: 'ThrowStatement',
                                argument: {
                                    type: 'NewExpression',
                                    callee: {
                                        type: 'Identifier',
                                        name: 'ReferenceError',
                                    },
                                    arguments: [{
                                        type: 'StringLiteral',
                                        value: start + '@Cannot redeclare export default',
                                    }],
                                },
                            },
                            start,
                            end,
                    });
                    delete node.declaration;
                    node.type = 'ExpressionStatement';
                    node.expression = {
                        type: 'AssignmentExpression',
                        operator: '=',
                        left: {
                            type: 'MemberExpression',
                            object: {
                                type: 'MemberExpression',
                                object: {
                                    type: 'Identifier',
                                    name: 'module',
                                },
                                property: {
                                    type: 'Identifier',
                                    name: 'exports',
                                },
                                computed: false,
                            },
                            property: {
                                type: 'Identifier',
                                name: 'default',
                            },
                            computed: false,
                        },
                        right: declaration,
                    }
                },
                ExportNamedDeclaration({ parent, node }){
                    if(parent.type !== 'Program') throw new SyntaxError('Export statements are only allowed at the top level of module');
                    isESM = true;
                    const { declaration, specifiers, source, start, end } = node;
                    if(declaration){
                        const declarations = declaration.declarations || [ declaration ];
                        delete node.declaration;
                        parent.body.unshift(...declarations.map(({ id: { name } }) => ({
                            type: 'IfStatement',
                            test: {
                                type: 'BinaryExpression',
                                left: {
                                    type: 'StringLiteral',
                                    value: name,
                                },
                                operator: 'in',
                                right: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'module',
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'exports',
                                    },
                                    computed: false,
                                }
                            },
                            consequent: {
                                type: 'ThrowStatement',
                                argument: {
                                    type: 'NewExpression',
                                    callee: {
                                        type: 'Identifier',
                                        name: 'ReferenceError',
                                    },
                                    arguments: [{
                                        type: 'StringLiteral',
                                        value: start + '@Cannot redeclare export ' + name,
                                    }],
                                },
                            },
                            start,
                            end,
                        })));
                        parent.body.splice(parent.body.indexOf(node), 0, declaration);
                        node.type = 'ExpressionStatement';
                        node.expression = {
                            type: 'CallExpression',
                            callee: {
                                type: 'MemberExpression',
                                object: {
                                    type: 'Identifier',
                                    name: 'Object',
                                },
                                property: {
                                    type: 'Identifier',
                                    name: 'defineProperties',
                                },
                            },
                            arguments: [
                                {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'module',
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'exports',
                                    },
                                    computed: false,
                                },
                                {
                                    type: 'ObjectExpression',
                                    properties: declarations.map(({ id: { name } }) => ({
                                        type: 'ObjectProperty',
                                        method: false,
                                        computed: false,
                                        shorthand: false,
                                        key: {
                                            type: 'Identifier',
                                            name,
                                        },
                                        value: {
                                            type: 'ObjectExpression',
                                            properties: [
                                                {
                                                    type: 'ObjectProperty',
                                                    method: false,
                                                    computed: false,
                                                    shorthand: false,
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'enumerable',
                                                    },
                                                    value: {
                                                        type: 'BooleanLiteral',
                                                        value: true,
                                                    },
                                                },
                                                {
                                                    type: 'ObjectMethod',
                                                    method: true,
                                                    computed: false,
                                                    generator: false,
                                                    async: false,
                                                    params: [],
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'get',
                                                    },
                                                    body: {
                                                        type: 'BlockStatement',
                                                        directives: [],
                                                        body: [{
                                                            type: 'ReturnStatement',
                                                            argument: {
                                                                type: 'Identifier',
                                                                name,
                                                            },
                                                        }],
                                                    },
                                                },
                                                {
                                                    type: 'ObjectMethod',
                                                    method: true,
                                                    computed: false,
                                                    generator: false,
                                                    async: false,
                                                    params: [],
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'set',
                                                    },
                                                    body: {
                                                        type: 'BlockStatement',
                                                        directives: [],
                                                        body: [],
                                                    },
                                                },
                                            ]
                                        },
                                    })),
                                },
                            ],
                        };
                    } else if(source){
                        parent.body.splice(parent.body.indexOf(node), 1);
                        promiseAllArr.push({
                            type: 'CallExpression',
                            callee: {
                                type: 'MemberExpression',
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
                                },
                            },
                            arguments: [{
                                type: 'ArrowFunctionExpression',
                                generator: false,
                                async: false,
                                params: [{
                                    type: 'Identifier',
                                    name: 'v',
                                }],
                                body: {
                                    type: 'BlockStatement',
                                    body: flatify(specifiers.filter(v => v.type === 'ExportSpecifier').map(({ local }) => {
                                        ensureType('Identifier', local);
                                        return [
                                            {
                                                type: 'IfStatement',
                                                test: {
                                                    type: 'UnaryExpression',
                                                    operator: '!',
                                                    prefix: true,
                                                    argument: {
                                                        type: 'BinaryExpression',
                                                        left: {
                                                            type: 'StringLiteral',
                                                            value: local.name,
                                                        },
                                                        operator: 'in',
                                                        right: {
                                                            type: 'Identifier',
                                                            name: 'v',
                                                        }
                                                    }
                                                },
                                                consequent: {
                                                    type: 'ThrowStatement',
                                                    argument: {
                                                        type: 'NewExpression',
                                                        callee: {
                                                            type: 'Identifier',
                                                            name: 'ReferenceError',
                                                        },
                                                        arguments: [{
                                                            type: 'StringLiteral',
                                                            value: start + '@Cannot find export ' + local.name + ' in ' + source.value,
                                                        }],
                                                    },
                                                },
                                            },
                                            {
                                                type: 'IfStatement',
                                                test: {
                                                    type: 'BinaryExpression',
                                                    left: {
                                                        type: 'StringLiteral',
                                                        value: local.name,
                                                    },
                                                    operator: 'in',
                                                    right: {
                                                        type: 'MemberExpression',
                                                        object: {
                                                            type: 'Identifier',
                                                            name: 'module',
                                                        },
                                                        property: {
                                                            type: 'Identifier',
                                                            name: 'exports',
                                                        },
                                                        computed: false,
                                                    }
                                                },
                                                consequent: {
                                                    type: 'ThrowStatement',
                                                    argument: {
                                                        type: 'NewExpression',
                                                        callee: {
                                                            type: 'Identifier',
                                                            name: 'ReferenceError',
                                                        },
                                                        arguments: [{
                                                            type: 'StringLiteral',
                                                            value: start + '@Cannot redeclare export ' + local.name,
                                                        }],
                                                    },
                                                },
                                            },
                                        ]
                                    }).concat([{
                                        type: 'CallExpression',
                                        callee: {
                                            type: 'MemberExpression',
                                            object: {
                                                type: 'Identifier',
                                                name: 'Object',
                                            },
                                            property: {
                                                type: 'Identifier',
                                                name: 'defineProperties',
                                            },
                                            computed: false,
                                        },
                                        arguments: [
                                            {
                                                type: 'MemberExpression',
                                                object: {
                                                    type: 'Identifier',
                                                    name: 'module',
                                                },
                                                property: {
                                                    type: 'Identifier',
                                                    name: 'exports',
                                                },
                                                computed: false,
                                            },
                                            {
                                                type: 'ObjectExpression',
                                                properties: specifiers.map(specifier => {
                                                    const { exported } = specifier;
                                                    ensureType('Identifier', exported);
                                                    const res = {
                                                        type: 'ObjectProperty',
                                                        method: false,
                                                        key: exported,
                                                        computed: false,
                                                        shorthand: false,
                                                    };
                                                    if(specifier.type === 'ExportSpecifier'){
                                                        const { local } = specifier;
                                                        ensureType('Identifier', local);
                                                        res.value = {
                                                            type: 'ObjectExpression',
                                                            properties: [
                                                                {
                                                                    type: 'ObjectMethod',
                                                                    method: true,
                                                                    computed: false,
                                                                    generator: false,
                                                                    async: false,
                                                                    params: [],
                                                                    key: {
                                                                        type: 'Identifier',
                                                                        name: 'get',
                                                                    },
                                                                    body: {
                                                                        type: 'BlockStatement',
                                                                        directives: [],
                                                                        body: [{
                                                                            type: 'ReturnStatement',
                                                                            argument: {
                                                                                type: 'MemberExpression',
                                                                                object: {
                                                                                    type: 'Identifier',
                                                                                    name: 'v',
                                                                                },
                                                                                property: {
                                                                                    type: 'Identifier',
                                                                                    name: local.name,
                                                                                },
                                                                                computed: false,
                                                                            },
                                                                        }],
                                                                    },
                                                                },
                                                                {
                                                                    type: 'ObjectMethod',
                                                                    method: true,
                                                                    computed: false,
                                                                    generator: false,
                                                                    async: false,
                                                                    params: [],
                                                                    key: {
                                                                        type: 'Identifier',
                                                                        name: 'set',
                                                                    },
                                                                    body: {
                                                                        type: 'BlockStatement',
                                                                        directives: [],
                                                                        body: [],
                                                                    },
                                                                },
                                                                {
                                                                    type: 'ObjectProperty',
                                                                    method: false,
                                                                    computed: false,
                                                                    shorthand: false,
                                                                    key: {
                                                                        type: 'Identifier',
                                                                        name: 'enumerable',
                                                                    },
                                                                    value: {
                                                                        type: 'BooleanLiteral',
                                                                        value: true,
                                                                    },
                                                                },
                                                            ],
                                                        }
                                                    } else if(specifier.type === 'ExportNamespaceSpecifier'){
                                                        res.value = {
                                                            type: 'ObjectExpression',
                                                            properties: [
                                                                {
                                                                    type: 'ObjectMethod',
                                                                    method: true,
                                                                    computed: false,
                                                                    generator: false,
                                                                    async: false,
                                                                    params: [],
                                                                    key: {
                                                                        type: 'Identifier',
                                                                        name: 'get',
                                                                    },
                                                                    body: {
                                                                        type: 'BlockStatement',
                                                                        directives: [],
                                                                        body: [{
                                                                            type: 'ReturnStatement',
                                                                            argument: {
                                                                                type: 'Identifier',
                                                                                name: 'v',
                                                                            },
                                                                        }],
                                                                    },
                                                                },
                                                                {
                                                                    type: 'ObjectMethod',
                                                                    method: true,
                                                                    computed: false,
                                                                    generator: false,
                                                                    async: false,
                                                                    params: [],
                                                                    key: {
                                                                        type: 'Identifier',
                                                                        name: 'set',
                                                                    },
                                                                    body: {
                                                                        type: 'BlockStatement',
                                                                        directives: [],
                                                                        body: [],
                                                                    },
                                                                },
                                                            ],
                                                        }
                                                    }
                                                    return res
                                                })
                                            },
                                        ],
                                    }])),
                                },
                            }],
                            start,
                            end,
                        })
                    } else {
                        parent.body.unshift(...specifiers.map(({ local, exported }) => (ensureType('Identifier', local, exported), {
                            type: 'IfStatement',
                            test: {
                                type: 'BinaryExpression',
                                operator: 'in',
                                left: {
                                    type: 'StringLiteral',
                                    value: exported.name,
                                },
                                right: {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'module',
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'exports',
                                    },
                                    computed: false,
                                },
                            },
                            consequent: {
                                type: 'ThrowStatement',
                                argument: {
                                    type: 'NewExpression',
                                    callee: {
                                        type: 'Identifier',
                                        name: 'ReferenceError',
                                    },
                                    arguments: [{
                                        type: 'StringLiteral',
                                        value: start + '@Cannot redeclare export ' + exported.name,
                                    }],
                                },
                            },
                            start,
                            end,
                        })));
                        node.type = 'ExpressionStatement';
                        node.expression = {
                            type: 'CallExpression',
                            callee: {
                                type: 'MemberExpression',
                                object: {
                                    type: 'Identifier',
                                    name: 'Object',
                                },
                                property: {
                                    type: 'Identifier',
                                    name: 'defineProperties',
                                },
                            },
                            arguments: [
                                {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'module',
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'exports',
                                    },
                                    computed: false,
                                },
                                {
                                    type: 'ObjectExpression',
                                    properties: specifiers.map(({ local, exported }) => ({
                                        type: 'ObjectProperty',
                                        method: false,
                                        computed: false,
                                        shorthand: false,
                                        key: {
                                            type: 'Identifier',
                                            name: exported.name,
                                        },
                                        value: {
                                            type: 'ObjectExpression',
                                            properties: [
                                                {
                                                    type: 'ObjectProperty',
                                                    method: false,
                                                    computed: false,
                                                    shorthand: false,
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'enumerable',
                                                    },
                                                    value: {
                                                        type: 'BooleanLiteral',
                                                        value: true,
                                                    },
                                                },
                                                {
                                                    type: 'ObjectMethod',
                                                    method: true,
                                                    computed: false,
                                                    generator: false,
                                                    async: false,
                                                    params: [],
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'get',
                                                    },
                                                    body: {
                                                        type: 'BlockStatement',
                                                        directives: [],
                                                        body: [{
                                                            type: 'ReturnStatement',
                                                            argument: {
                                                                type: 'Identifier',
                                                                name: local.name,
                                                            },
                                                        }],
                                                    },
                                                },
                                                {
                                                    type: 'ObjectMethod',
                                                    method: true,
                                                    computed: false,
                                                    generator: false,
                                                    async: false,
                                                    params: [],
                                                    key: {
                                                        type: 'Identifier',
                                                        name: 'set',
                                                    },
                                                    body: {
                                                        type: 'BlockStatement',
                                                        directives: [],
                                                        body: [],
                                                    },
                                                },
                                            ]
                                        },
                                    })),
                                },
                            ],
                        };
                    }
                },
                ExportAllDeclaration({ parent, node }){
                    if(parent.type !== 'Program') throw new SyntaxError('Export statements are only allowed at the top level of module');
                    const { source, start } = node;
                    delete node.source;
                    node.type = 'CallExpression';
                    node.callee = {
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
                        },
                    };
                    node.arguments = [{
                        type: 'ArrowFunctionExpression',
                        generator: false,
                        async: false,
                        params: [{
                            type: 'Identifier',
                            name: 'v',
                        }],
                        body: {
                            type: 'BlockStatement',
                            directives: [],
                            body: [
                                {
                                    type: 'VariableDeclaration',
                                    kind: 'const',
                                    declarations: [
                                        {
                                            type: 'VariableDeclarator',
                                            id: {
                                                type: 'Identifier',
                                                name: 'keys',
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
                                                        name: 'keys',
                                                    },
                                                },
                                                arguments: [{
                                                    type: 'Identifier',
                                                    name: 'v',
                                                }],
                                            },
                                        },
                                        {
                                            type: 'VariableDeclarator',
                                            id: {
                                                type: 'Identifier',
                                                name: 'props',
                                            },
                                            init: {
                                                type: 'ObjectExpression',
                                                properties: [],
                                            },
                                        },
                                    ],
                                },
                                {
                                    type: 'ForOfStatement',
                                    await: false,
                                    left: {
                                        type: 'VariableDeclaration',
                                        declarations: [{
                                            type: 'VariableDeclarator',
                                            id: {
                                                type: 'Identifier',
                                                name: 'key',
                                            },
                                            init: null,
                                        }],
                                        kind: 'const',
                                    },
                                    right: {
                                        type: 'Identifier',
                                        name: 'keys',
                                    },
                                    body: {
                                        type: 'BlockStatement',
                                        directives: [],
                                        body: [
                                            {
                                                type: 'IfStatement',
                                                test: {
                                                    type: 'BinaryExpression',
                                                    operator: 'in',
                                                    left: {
                                                        type: 'Identifier',
                                                        name: 'key',
                                                    },
                                                    right: {
                                                        type: 'MemberExpression',
                                                        computed: false,
                                                        object: {
                                                            type: 'Identifier',
                                                            name: 'module',
                                                        },
                                                        property: {
                                                            type: 'Identifier',
                                                            name: 'exports',
                                                        },
                                                    },
                                                },
                                                consequent: {
                                                    type: 'ThrowStatement',
                                                    argument: {
                                                        type: 'NewExpression',
                                                        callee: {
                                                            type: 'Identifier',
                                                            name: 'ReferenceError',
                                                        },
                                                        arguments: [{
                                                            type: 'BinaryExpression',
                                                            operator: '+',
                                                            left: {
                                                                type: 'StringLiteral',
                                                                value: start + '@Cannot redeclare export ',
                                                            },
                                                            right: {
                                                                type: 'Identifier',
                                                                name: 'key',
                                                            },
                                                        }],
                                                    },
                                                },
                                                alternate: null,
                                            },
                                            {
                                                type: 'ExpressionStatement',
                                                expression: {
                                                    type: 'AssignmentExpression',
                                                    operator: '=',
                                                    left: {
                                                        type: 'MemberExpression',
                                                        computed: true,
                                                        object: {
                                                            type: 'Identifier',
                                                            name: 'props',
                                                        },
                                                        property: {
                                                            type: 'Identifier',
                                                            name: 'key',
                                                        },
                                                    },
                                                    right: {
                                                        type: 'ObjectExpression',
                                                        properties: [
                                                            {
                                                                type: 'ObjectMethod',
                                                                method: true,
                                                                generator: false,
                                                                async: false,
                                                                kind: 'method',
                                                                params: [],
                                                                computed: false,
                                                                key: {
                                                                    type: 'Identifier',
                                                                    name: 'get',
                                                                },
                                                                body: {
                                                                    type: 'BlockStatement',
                                                                    directives: [],
                                                                    body: [{
                                                                        type: 'ReturnStatement',
                                                                        argument: {
                                                                            type: 'MemberExpression',
                                                                            computed: true,
                                                                            object: {
                                                                                type: 'Identifier',
                                                                                name: 'v',
                                                                            },
                                                                            property: {
                                                                                type: 'Identifier',
                                                                                name: 'key',
                                                                            },
                                                                        },
                                                                    }],
                                                                },
                                                            },
                                                            {
                                                                type: 'ObjectMethod',
                                                                method: true,
                                                                generator: false,
                                                                async: false,
                                                                kind: 'method',
                                                                params: [],
                                                                computed: false,
                                                                key: {
                                                                    type: 'Identifier',
                                                                    name: 'set',
                                                                },
                                                                body: {
                                                                    type: 'BlockStatement',
                                                                    directives: [],
                                                                    body: [],
                                                                },
                                                            },
                                                            {
                                                                type: 'ObjectProperty',
                                                                method: false,
                                                                computed: false,
                                                                shorthand: false,
                                                                key: {
                                                                    type: 'Identifier',
                                                                    name: 'enumerable',
                                                                },
                                                                value: {
                                                                    type: 'BooleanLiteral',
                                                                    value: true,
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    }
                                },
                                {
                                    type: 'ExpressionStatement',
                                    expression: {
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
                                                name: 'defineProperties',
                                            },
                                        },
                                        arguments: [
                                            {
                                                type: 'MemberExpression',
                                                computed: false,
                                                object: {
                                                    type: 'Identifier',
                                                    name: 'module',
                                                },
                                                property: {
                                                    type: 'Identifier',
                                                    name: 'exports',
                                                },
                                            },
                                            {
                                                type: 'Identifier',
                                                name: 'props',
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    }];
                    promiseAllArr.push(node);
                    parent.body.splice(parent.body.indexOf(node), 1)
                },
                CallExpression(path){
                    if(path.node.callee.type !== 'Import') return;
                    isESM = true;
                    path.node.callee.type = 'Identifier';
                    path.node.callee.name = 'requireAsync';
                },
                MetaProperty(path){
                    if(path.node.meta.name === 'import' && path.node.property.name === 'meta'){
                        isESM = true;
                        path.node.type = 'Identifier';
                        path.node.name = importMetaVariableName;
                    }
                },
                ExpressionStatement(path){
                    if(path.node !== eofTrigger) return;
                    const _isESM = isESM;
                    isESM = false;
                    const _promiseAllArr = promiseAllArr;
                    promiseAllArr = [];
                    const { parent } = path,
                        { body } = parent;
                    body.splice(body.indexOf(eofTrigger), 1);
                    if(_isESM) body.push({
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
                                    name: 'defineProperty',
                                },
                                computed: false,
                            },
                            arguments: [
                                {
                                    type: 'MemberExpression',
                                    object: {
                                        type: 'Identifier',
                                        name: 'module',
                                    },
                                    property: {
                                        type: 'Identifier',
                                        name: 'exports',
                                    },
                                    computed: false,
                                },
                                {
                                    type: 'StringLiteral',
                                    value: esModulePrivateProp,
                                },
                                {
                                    type: 'ObjectExpression',
                                    properties: [{
                                        type: 'ObjectProperty',
                                        method: false,
                                        key: {
                                            type: 'Identifier',
                                            name: 'value',
                                        },
                                        computed: false,
                                        shorthand: false,
                                        value: {
                                            type: 'BooleanLiteral',
                                            value: true,
                                        }
                                    }],
                                },
                            ],
                        },
                    });
                    const functionBody = _isESM ? [{
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
                                                                elements: _promiseAllArr,
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
                            body: [{
                                type: 'ExpressionStatement',
                                expression: {
                                    type: 'CallExpression',
                                    callee: {
                                        type: 'CallExpression',
                                        callee: {
                                            type: 'Identifier',
                                            name: 'await',
                                        },
                                        arguments: [{
                                            type: 'ArrowFunctionExpression',
                                            async: true,
                                            generator: false,
                                            body: {
                                                type: 'BlockStatement',
                                                body,
                                                directives: [{
                                                    type: 'Directive',
                                                    value: {
                                                        type: 'DirectiveLiteral',
                                                        value: 'use strict',
                                                    }
                                                }],
                                            },
                                            params: [],
                                        }]
                                    },
                                    arguments: [],
                                }
                            }],
                        },
                    }] : body;
                    parent.body = [{
                        type: 'ExpressionStatement',
                        expression: {
                            type: 'AssignmentExpression',
                            operator: '=',
                            left: {
                                type: 'MemberExpression',
                                object: {
                                    type: 'Identifier',
                                    name: 'module',
                                },
                                property: {
                                    type: 'Identifier',
                                    name: '_module',
                                },
                                computed: false,
                            },
                            right: {
                                type: 'ArrowFunctionExpression',
                                generator: false,
                                async: true,
                                body: {
                                    type: 'BlockStatement',
                                    body: functionBody,
                                    directives: [],
                                },
                                params: args.map(name => ({ type: 'Identifier', name })),
                            },
                        },
                    }]
                },
            }
        }
    });
})()
