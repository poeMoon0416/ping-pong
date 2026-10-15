// TODO: comとballの速さでバランス調整, 10ゲーム方式で半分まではある程度簡単に勝てる感じにする, タイトルとか回るハンドルとかレインボーの装飾をつける, ゲーム終了後は最初のシーンに戻る, デモでランダムな位置から射出
// TODO: クリア処理, 残りのシーン, アプリと各シーンをクラス化する
// シーンごとにクラス分けして別クラスの情報を直接参照できなくする(下記のような呼出は無効にする)
// => 再利用する必要がないからオブジェクトにした方が良いかも
// => オブジェクトは全てpublicなのでprivateフィールドを持たせるためにクラスにする
// => 使用する側を先に書きたいし長いのでシーンを別ファイルに分ける
// setSceneDemo();
// 調整パラメータを.envに分ける？
// グローバルなデータを SceneBase に分けて SceneXxx extends SceneBase とすれば分割できる？
// TODO: Scene.Demoより後のシーンの修正
// クライアントサイド実行なのでNode.jsのAPIがないので, .envは使えない
// import { env, loadEnvFile } from "node:process";
import ElementPositions from "./elemPosUtil.js";
//
// グローバルなデータの定義
//
// loadEnvFile(
//     "D:/ユーザーデータ/OneDrive/デスクトップ/vsc/my-ts-playing/src/ping-pong/js/.env"
// );
// const FOO = env.FOO;
// console.log(FOO);
// 要素の取得
const html = document.getElementsByTagName("html")[0];
const playerPoint = document.getElementById("player-point");
const comPoint = document.getElementById("com-point");
const ground = document.getElementById("ground");
const player = document.getElementById("player");
const com = document.getElementById("com");
const ball = document.getElementById("ball");
// スタイルの取得
const playerStyle = window.getComputedStyle(player);
const comStyle = window.getComputedStyle(com);
const ballStyle = window.getComputedStyle(ball);
// パラメータ調整
const movePlayerSpeedDownWeight = 2;
const movePlayerAutoMs = 200;
let movePlayerAutoTimeOut;
const moveComMs = 150;
// const moveComMs: number = 15000;
let moveComTimeOut;
const moveBallSpeed = 5;
const moveBallMs = 10;
let moveBallTimeout;
const changeSceneToPauseTimeoutMs = 3000;
const reDemoMs = 3000;
let reDemoTimeout;
const finishGameCnt = 3;
//
// シーン(ゲーム本体の処理)
//
/** ページを開いた直後の中央にボールが存在するシーン */
class ScenePause {
    start() {
        // ポイントのリセット
        playerPoint.textContent = "00";
        comPoint.textContent = "00";
        // シーン切替
        function changeSceneToDemo() {
            changeScene(Scene.Demo);
            // シーンごとにクラス分けして別クラスの情報を直接参照できなくする(下記のような呼出は無効にする)
            // => 再利用する必要がないからオブジェクトにした方が良いかも
            // => オブジェクトは全てpublicなのでprivateフィールドを持たせるためにクラスにする
            // => 使用する側を先に書きたいし長いのでシーンを別ファイルに分ける
            // setSceneDemo();
        }
        setTimeout(changeSceneToDemo, changeSceneToPauseTimeoutMs);
    }
    clear() { }
}
/** 開始前の待機シーン(デモモード) */
class SceneDemo {
    initIsMovingTop = calcRandom(2) % 2 == 0;
    ballIsMoving = {
        top: this.initIsMovingTop,
        right: true,
        bottom: !this.initIsMovingTop,
        left: false,
    };
    start() {
        // 位置の初期化
        player.style.top = numToPx((512 - 32) / 2 - 32 / 2);
        com.style.top = numToPx((512 - 32) / 2 - 32 / 2);
        ball.style.top = numToPx((512 - 32) / 2 - 16 / 2);
        // ボールをプレイヤーのもとへ移動する
        ball.style.left = numToPx(32);
        // console.log("demo start");
        // プレイヤーの移動(自動モード)
        movePlayerAutoTimeOut = setInterval(this.movePlayerAuto, movePlayerAutoMs);
        // コンピュータの移動
        moveComTimeOut = setInterval(this.moveCom, moveComMs);
        // ボールの移動
        this.initIsMovingTop = calcRandom(2) % 2 == 0;
        this.ballIsMoving = {
            top: this.initIsMovingTop,
            right: true,
            bottom: !this.initIsMovingTop,
            left: false,
        };
        // console.log(this.ballIsMoving);
        // thisをbindしないとコールバックとして呼び出されたときにthisがグローバルオブジェクト(window)になる, 引数として渡した方が良い？
        // moveBallTimeout = setInterval(this.moveBall, moveBallMs);
        moveBallTimeout = setInterval(this.moveBall.bind(this), moveBallMs);
        // シーン切替, 一回きりにしないと何重にもイベントハンドラが装着されてプレイヤーが爆速になる
        html.addEventListener("keydown", this.changeSceneToKickoff, {
            once: true,
        });
    }
    clear() {
        clearInterval(movePlayerAutoTimeOut);
        clearInterval(moveComTimeOut);
        clearInterval(moveBallTimeout);
        clearTimeout(reDemoTimeout);
    }
    movePlayerAuto() {
        moveTop(player, pxToNum(ballStyle.top) - pxToNum(playerStyle.top));
    }
    moveCom() {
        moveTop(com, pxToNum(ballStyle.top) - pxToNum(comStyle.top));
    }
    moveBall() {
        // console.log(this.ballIsMoving);
        // console.log(this);
        if (this.ballIsMoving.top) {
            moveBoundTop(ball, -moveBallSpeed, this.ballIsMoving);
        }
        if (this.ballIsMoving.right) {
            moveBoundLeft(ball, moveBallSpeed, this.ballIsMoving);
        }
        if (this.ballIsMoving.bottom) {
            moveBoundTop(ball, moveBallSpeed, this.ballIsMoving);
        }
        if (this.ballIsMoving.left) {
            moveBoundLeft(ball, -moveBallSpeed, this.ballIsMoving);
        }
    }
    changeSceneToKickoff(event) {
        if (event.key === "Shift") {
            changeScene(Scene.Kickoff);
        }
    }
}
/** 開始後にボールを打つのを待つ準備シーン */
class SceneKickoff {
    start() {
        // 位置の初期化
        player.style.top = numToPx((512 - 32) / 2 - 32 / 2);
        com.style.top = numToPx((512 - 32) / 2 - 32 / 2);
        ball.style.top = numToPx((512 - 32) / 2 - 16 / 2);
        // ボールをプレイヤーのもとへ移動する
        ball.style.left = numToPx(32);
        // プレイヤーの移動
        html.addEventListener("wheel", this.movePlayer);
        // コンピュータの移動
        moveComTimeOut = setInterval(this.moveCom, moveComMs);
        // ボールの移動
        html.addEventListener("wheel", this.moveBall);
        // シーン切替
        html.addEventListener("keydown", this.changeSceneToPlaying, {
            once: true,
        });
    }
    clear() {
        html.removeEventListener("wheel", this.movePlayer);
        clearInterval(moveComTimeOut);
        html.removeEventListener("wheel", this.moveBall);
    }
    movePlayer(event) {
        moveTop(player, event.deltaY / movePlayerSpeedDownWeight);
    }
    moveCom() {
        moveTop(com, pxToNum(ballStyle.top) - pxToNum(comStyle.top));
    }
    moveBall(event) {
        moveTop(ball, event.deltaY / movePlayerSpeedDownWeight);
    }
    changeSceneToPlaying(event) {
        if (event.key === "Shift") {
            changeScene(Scene.Playing);
        }
    }
}
/** ボールを打ち合っているシーン */
class ScenePlaying {
    initIsMovingTop = calcRandom(2) % 2 == 0;
    ballIsMoving = {
        top: this.initIsMovingTop,
        right: true,
        bottom: !this.initIsMovingTop,
        left: false,
    };
    start() {
        // プレイヤーの移動
        html.addEventListener("wheel", this.movePlayer);
        // コンピュータの移動
        moveComTimeOut = setInterval(this.moveCom, moveComMs);
        // ボールの移動
        this.initIsMovingTop = calcRandom(2) % 2 == 0;
        this.ballIsMoving = {
            top: this.initIsMovingTop,
            right: true,
            bottom: !this.initIsMovingTop,
            left: false,
        };
        moveBallTimeout = setInterval(this.moveBall.bind(this), moveBallMs);
    }
    clear() {
        html.removeEventListener("wheel", this.movePlayer);
        clearInterval(moveComTimeOut);
        clearInterval(moveBallTimeout);
    }
    movePlayer(event) {
        moveTop(player, event.deltaY / movePlayerSpeedDownWeight);
    }
    moveCom() {
        moveTop(com, pxToNum(ballStyle.top) - pxToNum(comStyle.top));
    }
    moveBall() {
        if (this.ballIsMoving.top) {
            moveBound(ball, -moveBallSpeed, 0, this.ballIsMoving);
        }
        if (this.ballIsMoving.right) {
            moveBound(ball, 0, moveBallSpeed, this.ballIsMoving);
        }
        if (this.ballIsMoving.bottom) {
            moveBound(ball, moveBallSpeed, 0, this.ballIsMoving);
        }
        if (this.ballIsMoving.left) {
            moveBound(ball, 0, -moveBallSpeed, this.ballIsMoving);
        }
    }
}
/** ゲーム終了後のシーン */
class SceneFinish {
    start() {
        window.alert(Number(playerPoint.textContent) >= finishGameCnt
            ? "player win"
            : "com win");
        this.changeSceneToPause();
    }
    clear() { }
    changeSceneToPause() {
        changeScene(Scene.Pause);
    }
}
// シーン列挙型
const Scene = {
    Pause: new ScenePause(),
    Demo: new SceneDemo(),
    Kickoff: new SceneKickoff(),
    Playing: new ScenePlaying(),
    Finish: new SceneFinish(),
};
// シーン切替の初期化
let currentScene = undefined;
async function changeScene(nextScene) {
    // シーンのクリア
    if (currentScene) {
        console.log(currentScene, "clear()");
        currentScene.clear();
    }
    // シーンのセット
    currentScene = nextScene;
    console.log(currentScene, "start()");
    currentScene.start();
}
changeScene(Scene.Pause);
//
// ユーティリティ
//
function move(elem, topInc, leftInc) {
    if (topInc) {
        moveTop(elem, topInc);
    }
    if (leftInc) {
        moveLeft(elem, leftInc);
    }
}
function moveTop(elem, topInc) {
    // グラウンドの下限・上限
    const topMin = 0;
    // (parentHeight - parentBorder) - childHeight
    const topMax = ground.clientHeight - elem.offsetHeight;
    // 調整前の縦位置
    const elemStyle = window.getComputedStyle(elem);
    const elemTop = pxToNum(elemStyle.top);
    const movedTop = elemTop + topInc;
    // 調整後の縦位置を反映
    elem.style.top = numToPx(Math.min(topMax, Math.max(topMin, movedTop)));
}
function moveLeft(elem, leftInc) {
    // グラウンドの下限・上限
    const leftMin = 0;
    // (parentWidth - parentBorder) - childWidth
    const leftMax = ground.clientWidth - elem.offsetWidth;
    // 調整前の横位置
    const elemStyle = window.getComputedStyle(elem);
    const elemLeft = pxToNum(elemStyle.left);
    const movedLeft = elemLeft + leftInc;
    // 調整後の横位置を反映
    elem.style.left = numToPx(Math.min(leftMax, Math.max(leftMin, movedLeft)));
}
function moveBound(elem, topInc, leftInc, isMoving) {
    if (topInc) {
        moveBoundTop(elem, topInc, isMoving);
    }
    if (leftInc) {
        moveBoundLeft(elem, leftInc, isMoving);
    }
}
function moveBoundTop(elem, topInc, isMoving) {
    // グラウンドの下限・上限
    const topMin = 0;
    // (parentHeight - parentBorder) - childHeight
    const topMax = ground.clientHeight - elem.offsetHeight;
    // 移動後の調整前の縦位置
    const elemStyle = window.getComputedStyle(elem);
    const elemTop = pxToNum(elemStyle.top);
    const movedTop = elemTop + topInc;
    // ボールが跳ねるかの判定
    if (movedTop < topMin || movedTop > topMax) {
        revVerticalMoving(isMoving);
    }
    // 調整後の縦位置を反映
    elem.style.top = numToPx(Math.min(topMax, Math.max(topMin, movedTop)));
}
function moveBoundLeft(elem, leftInc, isMoving) {
    // グラウンドの下限・上限
    const leftMin = 0;
    // (parentWidth - parentBorder) - childWidth
    const leftMax = ground.clientWidth - elem.offsetWidth;
    // 移動後の調整前の横位置
    const elemStyle = window.getComputedStyle(elem);
    const elemLeft = pxToNum(elemStyle.left);
    const movedLeft = elemLeft + leftInc;
    // 調整後の横位置を反映
    elem.style.left = numToPx(Math.min(leftMax, Math.max(leftMin, movedLeft)));
    // プレイヤー/コンピュータとの衝突判定
    const elemPos = new ElementPositions(elem, movedLeft);
    const playerPos = new ElementPositions(player);
    const comPos = new ElementPositions(com);
    if (elemPos.intersects(playerPos) || elemPos.intersects(comPos)) {
        revHorizontalMoving(isMoving);
    }
    // ゴール判定
    if (movedLeft < leftMin || movedLeft > leftMax) {
        // 移動停止
        stopMoving(isMoving);
        // 現在のシーンに依存する処理
        switch (currentScene) {
            case Scene.Demo:
                // 現在の同期処理の終了後にシーンの変更を予約したいのでシーンの変更は非同期関数にする必要がある(id="ball"のleftプロパティで差を確認可能)
                // 非同期関数にしない場合は残りの処理による上書きを防ぐためにシーン切替後の return; が必要となる
                // しかし, return; すると終了後の処理が実行されないので, 終了後の処理がシーン切替前にも必要になってしまう
                // これは非同期関数のイベント実行が予約される挙動で解決できる(現在の同期処理完了後に予約した非同期処理の実行, イベントループモデル)
                // ---
                // 調整後の横位置を反映
                // elem.style.left = numToPx(
                //     Math.min(leftMax, Math.max(leftMin, movedLeft))
                // );
                // シーン切替
                reDemoTimeout = setTimeout(() => {
                    changeScene(Scene.Demo);
                }, reDemoMs);
                // return;
                break;
            case Scene.Playing:
                // 勝利数カウント更新
                if (movedLeft < leftMin) {
                    comPoint.textContent = String(Number(comPoint.textContent) + 1).padStart(2, "0");
                }
                if (movedLeft > leftMax) {
                    playerPoint.textContent = String(Number(playerPoint.textContent) + 1).padStart(2, "0");
                }
                // シーン切替
                if (Number(comPoint.textContent) >= finishGameCnt ||
                    Number(playerPoint.textContent) >= finishGameCnt) {
                    setTimeout(() => {
                        changeScene(Scene.Finish);
                    }, 2000);
                }
                else {
                    setTimeout(() => {
                        changeScene(Scene.Kickoff);
                    }, 2000);
                }
                // return;
                break;
        }
    }
}
// 縦の移動を反転
function revVerticalMoving(isMoving) {
    if (isMoving.top) {
        isMoving.top = false;
        isMoving.bottom = true;
        return;
    }
    if (isMoving.bottom) {
        isMoving.bottom = false;
        isMoving.top = true;
        return;
    }
}
// 横の移動を反転
function revHorizontalMoving(isMoving) {
    if (isMoving.left) {
        isMoving.left = false;
        isMoving.right = true;
        return;
    }
    if (isMoving.right) {
        isMoving.right = false;
        isMoving.left = true;
        return;
    }
}
// 移動を停止
function stopMoving(isMoving) {
    isMoving.top = false;
    isMoving.right = false;
    isMoving.bottom = false;
    isMoving.left = false;
}
function pxToNum(px) {
    return Number(px.slice(0, -2));
}
function numToPx(num) {
    return `${num}px`;
}
/**
 * `乱数 < lim`となる乱数を計算する
 * @param lim 上限値
 * @returns 乱数
 */
function calcRandom(lim) {
    return Math.round(Math.random() * 10 ** lim.toString().length) % lim;
}
//# sourceMappingURL=index.js.map