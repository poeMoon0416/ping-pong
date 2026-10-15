/**
 * 要素の位置情報
 */
export default class ElementPositions {
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_classes
    #topLeft: ElementPosition;
    #topRight: ElementPosition;
    #bottomLeft: ElementPosition;
    #bottomRight: ElementPosition;

    /**
     * 要素の左上, 右上, 左下, 右下を取得して自身に設定する(offsetTop, offsetLeft, 右/下は横幅/高さ(offsetWidth/offsetHeight)を足す)
     *
     * @param elem もとになる要素
     */
    constructor(elem: HTMLElement, movedLeft: number = NaN) {
        if (Number.isNaN(movedLeft)) {
            // 移動後の位置が指定されなかった場合
            this.#topLeft = { x: elem.offsetLeft, y: elem.offsetTop };
            this.#topRight = {
                x: elem.offsetLeft + elem.offsetWidth,
                y: elem.offsetTop,
            };
            this.#bottomLeft = {
                x: elem.offsetLeft,
                y: elem.offsetTop + elem.offsetHeight,
            };
            this.#bottomRight = {
                x: elem.offsetLeft + elem.offsetWidth,
                y: elem.offsetTop + elem.offsetHeight,
            };
        } else {
            // 移動後の位置が指定された場合
            this.#topLeft = { x: movedLeft, y: elem.offsetTop };
            this.#topRight = {
                x: movedLeft + elem.offsetWidth,
                y: elem.offsetTop,
            };
            this.#bottomLeft = {
                x: movedLeft,
                y: elem.offsetTop + elem.offsetHeight,
            };
            this.#bottomRight = {
                x: movedLeft + elem.offsetWidth,
                y: elem.offsetTop + elem.offsetHeight,
            };
        }
    }

    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/get#%E3%82%AF%E3%83%A9%E3%82%B9%E5%86%85%E3%81%A7%E3%81%AE%E3%82%B2%E3%83%83%E3%82%BF%E3%83%BC%E3%81%AE%E4%BD%BF%E7%94%A8
    public get topLeft(): ElementPosition {
        return this.#topLeft;
    }

    get topRight(): ElementPosition {
        return this.#topRight;
    }

    get bottomLeft(): ElementPosition {
        return this.#bottomLeft;
    }

    get bottomRight(): ElementPosition {
        return this.#bottomRight;
    }

    // JSDoc: https://qiita.com/yamatai12/items/3482fc31b9c73c6938bd, https://jsdoc.app/
    /**
     * 要素同士が被っているかを判定する, 要素が矩形であることを前提とするので注意
     *
     * @param elemPos 被っているかどうか比較したい要素の位置情報
     *
     * @returns 被っているかどうかの真偽値
     */
    public intersects(elemPos: ElementPositions) {
        // 要素1組につき4頂点*4頂点=16回の判定, 凸包と呼ばれるものがあったような気がするがいったん保留
        for (const { x: thisElemPosX, y: thisElemPosY } of [
            this.topLeft,
            this.topRight,
            this.bottomLeft,
            this.bottomRight,
        ]) {
            // thisの任意の点がelemPosの内側かどうかを判定する
            if (
                thisElemPosX > elemPos.topLeft.x &&
                thisElemPosX < elemPos.topRight.x &&
                thisElemPosY > elemPos.topLeft.y &&
                thisElemPosY < elemPos.bottomLeft.y
            ) {
                return true;
            }
        }
        return false;
    }
}

/** 頂点の位置情報 */
export type ElementPosition = { x: number; y: number };
