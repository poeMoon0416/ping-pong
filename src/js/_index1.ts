// ピンポン玉がひたすら跳ねるバージョン

// 要素の取得
const html: HTMLHtmlElement = document.getElementsByTagName("html")[0];
const ground: HTMLElement = document.getElementById("ground")!;
const player: HTMLElement = document.getElementById("player")!;
const com: HTMLElement = document.getElementById("com")!;
const ball: HTMLElement = document.getElementById("ball")!;

// スタイルの取得
const groundStyle: CSSStyleDeclaration = window.getComputedStyle(ground);
const playerStyle: CSSStyleDeclaration = window.getComputedStyle(player);
const comStyle: CSSStyleDeclaration = window.getComputedStyle(com);
const ballStyle: CSSStyleDeclaration = window.getComputedStyle(ball);

// データ型の宣言
type IsMoving = {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
};

// ゲーム本体の処理
function startPrepareGameScene(event: KeyboardEvent): void {
    if (event.key === "Shift") {
        prepareGameScene();
    }
}
// 一回きりにしないと何重にもイベントハンドラが装着されてプレイヤーが爆速になる
html.addEventListener("keydown", startPrepareGameScene, { once: true });

function prepareGameScene(): void {
    // ボールをプレイヤーのもとへ移動する
    ball.style.left = numToPx(32);

    // プレイヤーの移動
    function movePlayer(event: WheelEvent): void {
        moveTop(player, event.deltaY);
    }
    html.addEventListener("wheel", movePlayer);

    // コンピュータの移動
    function moveCom(): void {
        moveTop(com, pxToNum(ballStyle.top) - pxToNum(comStyle.top));
    }
    const moveComTimeOut: NodeJS.Timeout = setInterval(moveCom, 1000);

    // ボールの移動
    function moveBall(event: WheelEvent): void {
        moveTop(ball, event.deltaY);
    }
    html.addEventListener("wheel", moveBall);

    // シーン切替
    function startPlayingGameScene(event: KeyboardEvent): void {
        if (event.key === "Shift") {
            html.removeEventListener("wheel", moveBall);
            playingGameScene();
        }
    }
    html.addEventListener("keydown", startPlayingGameScene, { once: true });
}

function playingGameScene(): void {
    // ボールの移動
    const initIsMovingTop: boolean = calcRandom(2) % 2 == 0;
    const ballIsMoving = {
        top: initIsMovingTop,
        right: true,
        bottom: !initIsMovingTop,
        left: false,
    };
    function moveBall() {
        if (ballIsMoving.top) {
            moveBound(ball, -10, 0, ballIsMoving);
        }
        if (ballIsMoving.right) {
            moveBound(ball, 0, 10, ballIsMoving);
        }
        if (ballIsMoving.bottom) {
            moveBound(ball, 10, 0, ballIsMoving);
        }
        if (ballIsMoving.left) {
            moveBound(ball, 0, -10, ballIsMoving);
        }
    }
    const moveBallTimeout = setInterval(moveBall, 10);
}

// ユーティリティ
function move(elem: HTMLElement, topInc: number, leftInc: number): void {
    if (topInc) {
        moveTop(elem, topInc);
    }
    if (leftInc) {
        moveLeft(elem, leftInc);
    }
}

function moveTop(elem: HTMLElement, topInc: number): void {
    const topMin: number = 0;
    // (parentHeight - parentBorder) - childHeight
    const topMax: number = ground.clientHeight - elem.offsetHeight;
    const elemStyle: CSSStyleDeclaration = window.getComputedStyle(elem);
    const elemTop: number = pxToNum(elemStyle.top);
    const movedTop: number = Math.min(
        topMax,
        Math.max(topMin, elemTop + topInc)
    );
    elem.style.top = numToPx(movedTop);
}

function moveLeft(elem: HTMLElement, leftInc: number): void {
    const leftMin: number = 0;
    // (parentWidth - parentBorder) - childWidth
    const leftMax: number = ground.clientWidth - elem.offsetWidth;
    const elemStyle: CSSStyleDeclaration = window.getComputedStyle(elem);
    const elemLeft: number = pxToNum(elemStyle.left);
    const movedLeft: number = Math.min(
        leftMax,
        Math.max(leftMin, elemLeft + leftInc)
    );
    elem.style.left = numToPx(movedLeft);
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
    const topMin: number = 0;
    // (parentHeight - parentBorder) - childHeight
    const topMax: number = ground.clientHeight - elem.offsetHeight;
    const elemStyle: CSSStyleDeclaration = window.getComputedStyle(elem);
    const elemTop: number = pxToNum(elemStyle.top);
    const movedTop: number = elemTop + topInc;
    if (movedTop < topMin) {
        isMoving.top = false;
        isMoving.bottom = true;
    }
    if (movedTop > topMax) {
        isMoving.bottom = false;
        isMoving.top = true;
    }
    elem.style.top = numToPx(movedTop);
}

function moveBoundLeft(
    elem: HTMLElement,
    leftInc: number,
    isMoving: IsMoving
): void {
    const leftMin: number = 0;
    // (parentWidth - parentBorder) - childWidth
    const leftMax: number = ground.clientWidth - elem.offsetWidth;
    const elemStyle: CSSStyleDeclaration = window.getComputedStyle(elem);
    const elemLeft: number = pxToNum(elemStyle.left);
    const movedLeft: number = elemLeft + leftInc;
    if (movedLeft < leftMin) {
        isMoving.left = false;
        isMoving.right = true;
    }
    if (movedLeft > leftMax) {
        isMoving.right = false;
        isMoving.left = true;
    }
    elem.style.left = numToPx(movedLeft);
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
