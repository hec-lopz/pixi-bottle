export function init(canvasContainer) {
  const app = new PIXI.Application({
    resizeTo: canvasContainer,
  });
  canvasContainer.appendChild(app.view);

  PIXI.Assets.add({
    alias: "t1",
    src: "./public/assets/Botella envuelta.png",
  });
  PIXI.Assets.add({
    alias: "t2",
    src: "./public/assets/Botella.png",
  });
  PIXI.Assets.add({
    alias: "t3",
    src: "./public/assets/sprite_sheets/modelo0.json",
  });

  PIXI.Assets.load(["t1", "t2", "t3", "t4"]).then(() => setup(app));
}

function setup(app) {
  globalThis.__PIXI_APP__ = app;
  const { width, height } = app.screen;
  const spriteSettings = {
    x: width / 2,
    y: height / 2,
  };

  const frames = [];
  for (let i = 2; i <= 16; i++) {
    frames.push(PIXI.Texture.from(`B${i}.png`));
  }

  const anim = Object.assign(new PIXI.AnimatedSprite(frames), spriteSettings);
  anim.scale.set(1);
  anim.anchor.set(0.5);
  anim.animationSpeed = 0.2;
  anim.loop = false;

  app.stage.addChild(anim);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointerdown", onPointerDown).on("pointerup", onPointerUp);
  anim.onComplete = onAnimationComplete;
  let initialPoint;
  let finalPoint;
  let played = false;

  function onAnimationComplete() {
    if (played) return;
    played = true;
  }
  function onPointerDown({ global: { x, y } }) {
    initialPoint = { x, y };
  }

  function onPointerUp({ global: { x, y } }) {
    finalPoint = { x, y };
    if (detectSwipeDown(initialPoint, finalPoint) && !played) {
      anim.play();
    }
  }
}

function detectSwipeDown(initialPoint, finalPoint) {
  var xAbs = Math.abs(initialPoint.x - finalPoint.x);

  var yAbs = Math.abs(initialPoint.y - finalPoint.y);

  //check if distance between two points is greater then 20 otherwise discard swap event
  if (!(xAbs > 20 || yAbs > 20)) return false;

  if (!(yAbs > xAbs && finalPoint.y > initialPoint.y)) return false;

  return true;
}
