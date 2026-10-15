// 値の直接指定を防ぐ, このシンボル変数はexportしていないので別ファイルからこの変数を直接指定するのも防げる(スクリプトでなくモジュールなのでファイルのスコープがつくられる)
// => このシンボルもセットでexportしないとシンボルなら何でもokになってしまう(完全なenumの代替はつくれない)
export const ScenePause = Symbol();
export const SceneDemo = Symbol();
export const SceneStart = Symbol();
export const ScenePlay = Symbol();
export const SceneFinish = Symbol();

const Scene = {
    Pause: ScenePause,
    Demo: SceneDemo,
    Start: SceneStart,
    Play: ScenePlay,
    Finish: SceneFinish,
} as const;
type Scene = (typeof Scene)[keyof typeof Scene];

export default Scene;

// オブジェクトリテラルでなくclassを併用する
