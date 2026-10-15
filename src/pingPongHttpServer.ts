import http, {
    IncomingMessage,
    ServerResponse,
    type OutgoingHttpHeaders,
} from "node:http";
import fs from "node:fs";
import { env, loadEnvFile } from "node:process";

// .envファイルの内容を環境変数として読み込む
loadEnvFile("src/.env");
const PORT: number = Number(env.PORT);
const HOST: string = env.HOST!;
const SRC_APP_ROOT: string = env.SRC_APP_ROOT!;
const DIST_APP_ROOT: string = env.DIST_APP_ROOT!;
// 環境変数に存在するものはloadEnvFile()しなくても読み込める(env.DBPASS)
// console.log(PORT, HOST, SRC_APP_ROOT, DIST_APP_ROOT, env.DBPASS);

http.createServer((req, res) => {
    const { method, url } = req;
    switch (url) {
        case "/":
            html(req, res, `${SRC_APP_ROOT}/index.html`);
            break;
        case "/css/common.css":
            css(req, res, `${SRC_APP_ROOT}/css/common.css`);
            break;
        case "/css/index.css":
            css(req, res, `${SRC_APP_ROOT}/css/index.css`);
            break;
        case "/index.js":
            js(req, res, `${DIST_APP_ROOT}/js/index.js`, "index.js.map");
            break;
        case "/elemPosUtil.js":
            js(
                req,
                res,
                `${DIST_APP_ROOT}/js/elemPosUtil.js`,
                "elemPosUtil.js.map"
            );
            break;
        // sourceMap用
        case "/index.js.map":
            json(req, res, `${DIST_APP_ROOT}/js/index.js.map`);
            break;
        case "/index.ts":
            ts(req, res, `${SRC_APP_ROOT}/js/index.ts`);
            break;
        case "/elemPosUtil.js.map":
            json(req, res, `${DIST_APP_ROOT}/js/elemPosUtil.js.map`);
            break;
        case "/elemPosUtil.ts":
            ts(req, res, `${SRC_APP_ROOT}/js/elemPosUtil.ts`);
            break;
        // favicon用
        case "/favicon.ico":
            favicon(req, res, `${SRC_APP_ROOT}/img/favicon.ico`);
            break;
    }
}).listen(PORT, HOST);
console.log(`http://${HOST}:${PORT}`);

function html(req: IncomingMessage, res: ServerResponse, path: string): void {
    res.writeHead(200, "OK", { "content-type": "text/html" }).end(
        fs.readFileSync(path)
    );
}

function css(req: IncomingMessage, res: ServerResponse, path: string): void {
    res.writeHead(200, "OK", { "content-type": "text/css" }).end(
        fs.readFileSync(path)
    );
}

function js(
    req: IncomingMessage,
    res: ServerResponse,
    path: string,
    sourceMap: string
): void {
    const resHeader: OutgoingHttpHeaders = {
        "Content-Type": "text/javascript",
        SourceMap: sourceMap,
    };
    res.writeHead(200, "OK", resHeader).end(fs.readFileSync(path));
}

function json(req: IncomingMessage, res: ServerResponse, path: string): void {
    res.writeHead(200, "OK", { "Content-Type": "application/json" }).end(
        fs.readFileSync(path)
    );
}

function ts(req: IncomingMessage, res: ServerResponse, path: string): void {
    res.writeHead(200, "OK", { "Content-Type": "application/typescript" }).end(
        fs.readFileSync(path)
    );
}

function favicon(
    req: IncomingMessage,
    res: ServerResponse,
    path: string
): void {
    res.writeHead(200, "OK", {
        "Content-Type": "image/vnd.microsoft.icon",
    }).end(fs.readFileSync(path));
}
