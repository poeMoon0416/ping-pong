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
const html: HTMLHtmlElement = document.getElementsByTagName("html")[0];
const playerPoint: HTMLElement = document.getElementById("player-point")!;
const comPoint: HTMLElement = document.getElementById("com-point")!;
const ground: HTMLElement = document.getElementById("ground")!;
const player: HTMLElement = document.getElementById("player")!;
const com: HTMLElement = document.getElementById("com")!;
const ball: HTMLElement = document.getElementById("ball")!;

// スタイルの取得
const playerStyle: CSSStyleDeclaration = window.getComputedStyle(player);
const comStyle: CSSStyleDeclaration = window.getComputedStyle(com);
const ballStyle: CSSStyleDeclaration = window.getComputedStyle(ball);

// 動いている方向
type IsMoving = {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
};

// パラメータ調整
const movePlayerSpeedDownWeight: number = 2;

const movePlayerAutoMs: number = 200;
let movePlayerAutoTimeOut: NodeJS.Timeout;

const moveComMs: number = 150;
// const moveComMs: number = 15000;
let moveComTimeOut: NodeJS.Timeout;

const moveBallSpeed: number = 5;
const moveBallMs: number = 10;
let moveBallTimeout: NodeJS.Timeout;

const changeSceneToPauseTimeoutMs: number = 3000;

const reDemoMs: number = 3000;
let reDemoTimeout: NodeJS.Timeout;

const finishGameCnt: number = 3;

//
// シーン(ゲーム本体の処理)
//

/** ページを開いた直後の中央にボールが存在するシーン */
class ScenePause {
    public start() {
        // ポイントのリセット
        playerPoint.textContent = "00";
        comPoint.textContent = "00";

        // シーン切替
        function changeSceneToDemo(): void {
            changeScene(Scene.Demo);
            // シーンごとにクラス分けして別クラスの情報を直接参照できなくする(下記のような呼出は無効にする)
            // => 再利用する必要がないからオブジェクトにした方が良いかも
            // => オブジェクトは全てpublicなのでprivateフィールドを持たせるためにクラスにする
            // => 使用する側を先に書きたいし長いのでシーンを別ファイルに分ける
            // setSceneDemo();
        }
        setTimeout(changeSceneToDemo, changeSceneToPauseTimeoutMs);
    }

    public clear(): void {}
}

/** 開始前の待機シーン(デモモード) */
class SceneDemo {
    private initIsMovingTop: boolean = calcRandom(2) % 2 == 0;

    private ballIsMoving: IsMoving = {
        top: this.initIsMovingTop,
        right: true,
        bottom: !this.initIsMovingTop,
        left: false,
    };

    public start(): void {
        // 位置の初期化
        player.style.top = numToPx((512 - 32) / 2 - 32 / 2);
        com.style.top = numToPx((512 - 32) / 2 - 32 / 2);
        ball.style.top = numToPx((512 - 32) / 2 - 16 / 2);
        // ボールをプレイヤーのもとへ移動する
        ball.style.left = numToPx(32);

        // console.log("demo start");
        // プレイヤーの移動(自動モード)
        movePlayerAutoTimeOut = setInterval(
            this.movePlayerAuto,
            movePlayerAutoMs
        );

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

    public clear(): void {
        clearInterval(movePlayerAutoTimeOut);
        clearInterval(moveComTimeOut);
        clearInterval(moveBallTimeout);
        clearTimeout(reDemoTimeout);
    }

    private movePlayerAuto(): void {
        moveTop(player, pxToNum(ballStyle.top) - pxToNum(playerStyle.top));
    }

    private moveCom(): void {
        moveTop(com, pxToNum(ballStyle.top) - pxToNum(comStyle.top));
    }

    private moveBall(): void {
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

    private changeSceneToKickoff(event: KeyboardEvent): void {
        if (event.key === "Shift") {
            changeScene(Scene.Kickoff);
        }
    }
}

/** 開始後にボールを打つのを待つ準備シーン */
class SceneKickoff {
    start(): void {
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

    clear(): void {
        html.removeEventListener("wheel", this.movePlayer);
        clearInterval(moveComTimeOut);
        html.removeEventListener("wheel", this.moveBall);
    }

    private movePlayer(event: WheelEvent): void {
        moveTop(player, event.deltaY / movePlayerSpeedDownWeight);
    }

    private moveCom(): void {
        moveTop(com, pxToNum(ballStyle.top) - pxToNum(comStyle.top));
    }

    private moveBall(event: WheelEvent): void {
        moveTop(ball, event.deltaY / movePlayerSpeedDownWeight);
    }

    private changeSceneToPlaying(event: KeyboardEvent): void {
        if (event.key === "Shift") {
            changeScene(Scene.Playing);
        }
    }
}

/** ボールを打ち合っているシーン */
class ScenePlaying {
    private initIsMovingTop: boolean = calcRandom(2) % 2 == 0;

    private ballIsMoving: IsMoving = {
        top: this.initIsMovingTop,
        right: true,
        bottom: !this.initIsMovingTop,
        left: false,
    };

    start(): void {
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

    clear(): void {
        html.removeEventListener("wheel", this.movePlayer);
        clearInterval(moveComTimeOut);
        clearInterval(moveBallTimeout);
    }

    private movePlayer(event: WheelEvent): void {
        moveTop(player, event.deltaY / movePlayerSpeedDownWeight);
    }

    private moveCom(): void {
        moveTop(com, pxToNum(ballStyle.top) - pxToNum(comStyle.top));
    }

    private moveBall(): void {
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
    start(): void {
        window.alert(
            Number(playerPoint.textContent) >= finishGameCnt
                ? "player win"
                : "com win"
        );
        this.changeSceneToPause();
    }

    clear(): void {}

    private changeSceneToPause(): void {
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
} as const;
type Scene = (typeof Scene)[keyof typeof Scene];

// シーン切替の初期化
let currentScene: Scene | undefined = undefined;
async function changeScene(nextScene: Scene): Promise<void> {
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

function move(elem: HTMLElement, topInc: number, leftInc: number): void {
    if (topInc) {
        moveTop(elem, topInc);
    }
    if (leftInc) {
        moveLeft(elem, leftInc);
    }
}

function moveTop(elem: HTMLElement, topInc: number): void {
    // グラウンドの下限・上限
    const topMin: number = 0;
    // (parentHeight - parentBorder) - childHeight
    const topMax: number = ground.clientHeight - elem.offsetHeight;

    // 調整前の縦位置
    const elemStyle: CSSStyleDeclaration = window.getComputedStyle(elem);
    const elemTop: number = pxToNum(elemStyle.top);
    const movedTop: number = elemTop + topInc;

    // 調整後の縦位置を反映
    elem.style.top = numToPx(Math.min(topMax, Math.max(topMin, movedTop)));
}

function moveLeft(elem: HTMLElement, leftInc: number): void {
    // グラウンドの下限・上限
    const leftMin: number = 0;
    // (parentWidth - parentBorder) - childWidth
    const leftMax: number = ground.clientWidth - elem.offsetWidth;

    // 調整前の横位置
    const elemStyle: CSSStyleDeclaration = window.getComputedStyle(elem);
    const elemLeft: number = pxToNum(elemStyle.left);
    const movedLeft: number = elemLeft + leftInc;

    // 調整後の横位置を反映
    elem.style.left = numToPx(Math.min(leftMax, Math.max(leftMin, movedLeft)));
}

function moveBound(
    elem: HTMLElement,
    topInc: number,
    leftInc: number,
    isMoving: IsMoving
): void {
    if (topInc) {
        moveBoundTop(elem, topInc, isMoving);
    }
    if (leftInc) {
        moveBoundLeft(elem, leftInc, isMoving);
    }
}

function moveBoundTop(
    elem: HTMLElement,
    topInc: number,
    isMoving: IsMoving
): void {
    // グラウンドの下限・上限
    const topMin: number = 0;
    // (parentHeight - parentBorder) - childHeight
    const topMax: number = ground.clientHeight - elem.offsetHeight;

    // 移動後の調整前の縦位置
    const elemStyle: CSSStyleDeclaration = window.getComputedStyle(elem);
    const elemTop: number = pxToNum(elemStyle.top);
    const movedTop: number = elemTop + topInc;

    // ボールが跳ねるかの判定
    if (movedTop < topMin || movedTop > topMax) {
        revVerticalMoving(isMoving);
    }

    // 調整後の縦位置を反映
    elem.style.top = numToPx(Math.min(topMax, Math.max(topMin, movedTop)));
}

function moveBoundLeft(
    elem: HTMLElement,
    leftInc: number,
    isMoving: IsMoving
): void {
    // グラウンドの下限・上限
    const leftMin: number = 0;
    // (parentWidth - parentBorder) - childWidth
    const leftMax: number = ground.clientWidth - elem.offsetWidth;

    // 移動後の調整前の横位置
    const elemStyle: CSSStyleDeclaration = window.getComputedStyle(elem);
    const elemLeft: number = pxToNum(elemStyle.left);
    const movedLeft: number = elemLeft + leftInc;

    // 調整後の横位置を反映
    elem.style.left = numToPx(Math.min(leftMax, Math.max(leftMin, movedLeft)));

    // プレイヤー/コンピュータとの衝突判定
    const elemPos: ElementPositions = new ElementPositions(elem, movedLeft);
    const playerPos: ElementPositions = new ElementPositions(player);
    const comPos: ElementPositions = new ElementPositions(com);
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
                    comPoint.textContent = String(
                        Number(comPoint.textContent) + 1
                    ).padStart(2, "0");
                }
                if (movedLeft > leftMax) {
                    playerPoint.textContent = String(
                        Number(playerPoint.textContent) + 1
                    ).padStart(2, "0");
                }

                // シーン切替
                if (
                    Number(comPoint.textContent) >= finishGameCnt ||
                    Number(playerPoint.textContent) >= finishGameCnt
                ) {
                    setTimeout(() => {
                        changeScene(Scene.Finish);
                    }, 2000);
                } else {
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
function revVerticalMoving(isMoving: IsMoving): void {
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
function revHorizontalMoving(isMoving: IsMoving): void {
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
function stopMoving(isMoving: IsMoving): void {
    isMoving.top = false;
    isMoving.right = false;
    isMoving.bottom = false;
    isMoving.left = false;
}

function pxToNum(px: string): number {
    return Number(px.slice(0, -2));
}

function numToPx(num: number): string {
    return `${num}px`;
}

/**
 * `乱数 < lim`となる乱数を計算する
 * @param lim 上限値
 * @returns 乱数
 */
function calcRandom(lim: number): number {
    return Math.round(Math.random() * 10 ** lim.toString().length) % lim;
}
