// TS列挙型: https://typescriptbook.jp/reference/values-types-variables/enum/enum-problems-and-alternatives-to-enums
// TSインデックスアクセス型: https://typescriptbook.jp/reference/type-reuse/indexed-access-types
// オブジェクト型: typeof Obj
// キー型: keyof typeof Obj
// バリュー型: (typeof Obj)[keyof typeof Obj]
// ---
// `{ ... } as const`: 定数オブジェクトを定義する, 全てのプロパティが読取専用になる
// `typeof obj`: オブジェクトからオブジェクト型を抽出する, 変数と型で同じ名前が存在していても別扱い
// `keyof objType`: オブジェクト型からキー型(プロパティ名のユニオン型)を抽出する
// `objType[keyType]`: オブジェクト型とキー型からバリュー型(値のユニオン型)を抽出する

// enum(Scene.Pause型になる)
// enum Scene {
//     Pause,
//     Demo,
//     Start,
//     Play,
//     Finish,
// }
// let currentScene: Scene = Scene.Pause;

// 型エイリアス(ユニオン型, "Pause"になる)
// type Scene = "Pause" | "Demo" | "Start" | "Play" | "Finish";
// let currentScene: Scene = "Pause";

// 下記間違っているので注意
// オブジェクトリテラル
// `{ ... } as const`: 定数オブジェクトを定義する, 全てのプロパティが読取専用になる
// const Scene = {
//     Pause: 0,
//     Demo: 1,
//     Start: 2,
//     Play: 3,
//     Finish: 4,
// } as const;
// `typeof`: オブジェクトからオブジェクト型を抽出する, 変数と型で同じ名前が存在していても別扱い
// type Scene = typeof Scene;
// `keyof`: オブジェクト型からプロパティ名のユニオン型を抽出する
// type SceneKey = keyof Scene;
// type Scene = keyof typeof Scene;
// let currentScene: Scene = "Pause";
// 宣言と代入を分けても同じ
// let currentScene: Scene;
// currentScene = "Pause";

// while (true) {
//     // switch文(型アサーションを使ってコンパイラの推論を上書きするとうまくいく)
//     // switch (currentScene) {
//     switch (currentScene as Scene) {
//         case "Pause":
//             pause();
//             break;
//         // 関数の中から外を書き換えているのは認識できないようだ
//         case "Demo":
//             demo();
//             break;
//     }
// }

// setInterval(() => {
//     // switch文(型アサーションを使ってコンパイラの推論を上書きするとうまくいく)
//     // switch (currentScene as Scene) {
//     switch (currentScene) {
//         case "Pause":
//             pause();
//             break;
//         // 関数の中から外を書き換えているのは認識できないようだ
//         case "Demo":
//             demo();
//             break;
//     }
// }, 1000);

// function pause() {
//     console.log(currentScene);
//     currentScene = "Demo";
// }

// function demo() {
//     console.log(currentScene);
//     currentScene = "Pause";
// }

// while (true) {
//     // switch文(型アサーションを使ってコンパイラの推論を上書きするとうまくいく)
//     // switch (currentScene) {
//     switch (currentScene as Scene) {
//         case "Pause":
//             await pause();
//             break;
//         // 関数の中から外を書き換えているのは認識できないようだ
//         case "Demo":
//             await demo();
//             break;
//     }
// }

// async function pause() {
//     console.log(currentScene);
//     setTimeout(() => {
//         globalThis.currentScene = "Demo";
//     }, 1000);
//     while (true) {
//         console.log(currentScene);
//         if (currentScene !== "Pause") {
//             break;
//         }
//     }
// }

// async function demo() {
//     console.log(currentScene);
//     setTimeout(() => {
//         currentScene = "Pause";
//     }, 1000);
//     while (true) {
//         console.log(currentScene);
//         if (currentScene !== "Demo") {
//             break;
//         }
//     }
// }

// [シーン切替の仕組み(下記コード)]
// ボツ案...同期処理だからシーンに対応する関数の実行継続待機動作(while(true))に邪魔されてシーンの変更(setTimeout)が実行されなくなる
// 現在のシーンに対応する関数を実行する
// シーンに対応する関数は明示的に終了するまで実行が継続する
// シーン内の任意のタイミングで現在のシーンを変更して実行を停止する

// let currentSceneFn = pause;
// while (true) {
//     currentSceneFn();
// }

// function pause() {
//     console.log("pause");
//     setTimeout(() => {
//         currentSceneFn = demo;
//     }, 1000);
//     // 同期処理が終了しないとイベントループが実行されず非同期処理が実行されないようだ(シングルスレッドを占有する)
//     while (true) {
//         if (currentSceneFn !== pause) {
//             return;
//         }
//     }
// }

// function demo() {
//     console.log("demo");
//     setTimeout(() => {
//         currentSceneFn = pause;
//     }, 1000);
//     while (true) {
//         if (currentSceneFn !== demo) {
//             return;
//         }
//     }
// }

// [シーン切替の仕組み(下記コード)]
// シーンの開始: 現在のシーンに対応する関数を実行する
// シーンの変更: シーン内の任意のタイミングで現在のシーンを変更する
// シーンの終了: シーン内で設定したイベントハンドラ等をクリアする

type Scene = "demo" | "play" | "goal";
let prevScene = "";
const initScene = "demo";
changeScene();

function changeScene(scene: Scene = initScene): void {
    switch (prevScene) {
        case "demo":
            clearDemo();
            break;
        case "play":
            clearPlay();
            break;
        case "goal":
            clearGoal();
            break;
        default:
            break;
    }

    switch (scene) {
        case "demo":
            demo();
            break;
        case "play":
            play();
            break;
        case "goal":
            goal();
            break;
    }
    prevScene = scene;
}

function demo() {
    console.log("demo");
    setTimeout(() => {
        changeScene("play");
    }, 1000);
}

function play() {
    console.log("play");
    setTimeout(() => {
        changeScene("goal");
    }, 1000);
}

function goal() {
    console.log("goal");
    setTimeout(() => {
        changeScene("demo");
    }, 1000);
}

function clearDemo() {
    console.log("clear demo");
}

function clearPlay() {
    console.log("clear play");
}

function clearGoal() {
    console.log("clear goal");
}
