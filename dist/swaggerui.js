"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const swagger_client_1 = require("swagger-client");
const request_1 = require("request");
module.exports = function registerNode(RED) {
    function SwaggerUiNode(config) {
        let node = this;
        RED.nodes.createNode(node, config);
        // ,
        //  function SwaggerUiNode (node: Node, config: SwaggerUiProps) {
        //    RED.nodes.createNode(node, config);
        //  function SwaggerUiNode (config) {
        //    RED.nodes.createNode(this,config);
        //    let node = this;
        this.on('input', (msg) => __awaiter(this, void 0, void 0, function* () {
            let url = config.url || msg.url;
            let api = config.api || msg.api;
            let resource = config.resource || msg.resource;
            // let params = config.params || msg.params;
            let params = Object.assign({}, config.params, msg.params);
            let headers = Object.assign({}, config.headers, msg.headers);
            if (!(url && api && resource)) {
                node.error('Missing configuration values', msg);
                return;
            }
            console.log('url: ' + url);
            console.log('api: ' + api);
            console.log('resource: ' + resource);
            console.log('params: ' + JSON.stringify(params));
            if (params && params['_isModel']) {
                for (let key in params) {
                    if (key !== '_isModel') {
                        try {
                            params = {
                                body: JSON.parse(params[key])
                            };
                        }
                        catch (e) {
                            node.error('Bad JSON in object: ' + key, msg);
                            return;
                        }
                    }
                }
            }
            swagger_client_1.swaggerjs(url).then(function (client) {
                console.log('client.spec.paths: ' + JSON.stringify(client.spec.paths)); // Check for missing params
                let missingParams = getMissingParams(findApiReqParams(api, resource, client), params);
                console.log('missingParams: ', missingParams);
                if (missingParams) {
                    node.error('Missing params: ' + missingParams.toString(), msg);
                    return;
                }
                else {
                    client.apis[api][resource](params, {
                        responseContentType: 'application/json',
                        requestInterceptor: (req) => {
                            console.log('req: ', req);
                            req.headers = Object.assign({}, headers, req.headers);
                            return req;
                        }
                    }).then(function (resp) {
                        console.log('resp: ', resp);
                        msg.statusCode = resp.status;
                        msg.payload = resp.obj;
                        node.send(msg);
                        return;
                    }).catch(function (err) {
                        console.log('err: ', err);
                        msg.statusCode = err.status;
                        msg.payload = err.obj;
                        node.send(msg);
                        return;
                    });
                }
            }).catch(function (err) {
                node.error(err, msg);
                return;
            });
        }));
    }
    RED.nodes.registerType('swaggerui', SwaggerUiNode);
    function findApiReqParams(api, resource, client) {
        let reqParams = [];
        let paths = client.spec.paths;
        console.log('paths', JSON.stringify(paths));
        Object.keys(paths).forEach(function (pathKey) {
            let path = paths[pathKey];
            console.log('path', JSON.stringify(path));
            Object.keys(path).forEach(function (operationKey) {
                let operation = path[operationKey];
                if (operation.tags && operation.tags.indexOf(api) >= 0 && operation.operationId === resource) {
                    let parameters = operation.parameters;
                    parameters = [];
                    console.log('parameters: ', parameters);
                    parameters.forEach(function (parameter) {
                        reqParams.push(parameter.name);
                    });
                }
            });
        });
        return reqParams;
    }
    function getMissingParams(reqParams, params) {
        let missingParams;
        for (let i = 0; i < reqParams.length; i++) {
            if (!(params && params.hasOwnProperty(reqParams[i]))) {
                if (!missingParams) {
                    missingParams = [];
                }
                missingParams.push(reqParams[i]);
            }
        }
        return (missingParams || null);
    }
    function sendFile(res, filename) {
        // Use the right function depending on Express 3.x/4.x
        if (res.sendFile) {
            res.sendFile(filename);
        }
        else {
            res.sendfile(filename);
        }
    }
    function proxySwaggerRequest(res, url) {
        console.log('res', res);
        console.log('url', url);
        request_1.request.get(url, function (err, resp, data) {
            if (err) {
                res.status(500).send(err);
            }
            else if (resp.statusCode !== 200) {
                res.status(resp.statusCode).send(data);
            }
            else {
                res.send(data);
            }
        });
    }
    RED.httpAdmin.get('/swagger-client/js/*', function (req, res) {
        let filename = path.join(__dirname, '../js', req.params[0]);
        sendFile(res, filename);
    });
    RED.httpAdmin.get('/swagger-client/proxy', function (req, res) {
        if (req.query && req.query.swaggerUrl) {
            let url = decodeURIComponent(req.query.swaggerUrl);
            proxySwaggerRequest(res, url);
        }
        else {
            res.status(400).send('Please pass a valid Swagger URL as a query param.');
        }
    });
};
