const fanfare = new Audio("../public/assets/audio/fanfare.mp3");
const drumRoll = new Audio("../public/assets/audio/drum_roll.mp3");

export function init(canvasContainer) {
  const app = new PIXI.Application({
    backgroundAlpha: 0,
    resizeTo: canvasContainer,
  });
  canvasContainer.appendChild(app.view);

  PIXI.Assets.add({
    alias: "t1",
    src: "../public/assets/Botella envuelta.png",
  });
  PIXI.Assets.add({
    alias: "t2",
    src: "../public/assets/Botella.png",
  });
  PIXI.Assets.add({
    alias: "t3",
    src: "../public/assets/fighter.json",
  });
  PIXI.Assets.add({
    alias: "t4",
    src: "../public/assets/light_rotate_1.png",
  });
  PIXI.Assets.add({
    alias: "t5",
    src: "../public/assets/light_rotate_2.png",
  });

  PIXI.Assets.load(["t1", "t2", "t3", "t4", "t5"]).then(() => setup(app));
}

function setup(app) {
  const { width, height } = app.screen;
  let count = 0;
  const spriteSettings = {
    x: width / 2,
    y: height / 2,
  };

  globalThis.__PIXI_APP__ = app;

  const frames = [];
  for (let i = 0; i < 30; i++) {
    const val = i < 10 ? `0${i}` : i;
    frames.push(PIXI.Texture.from(`rollSequence00${val}.png`));
  }

  const light = Object.assign(PIXI.Sprite.from("t4"), spriteSettings);
  light.anchor.set(0.5);
  const light2 = Object.assign(PIXI.Sprite.from("t5"), spriteSettings);
  light2.anchor.set(0.5);

  const anim = Object.assign(new PIXI.AnimatedSprite(frames), spriteSettings);
  anim.anchor.set(0.5);
  anim.scale.set(1.5);
  anim.animationSpeed = 0.4;
  anim.loop = false;

  app.stage.addChild(light, light2, anim);

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage.on("pointerdown", onPointerDown).on("pointerup", onPointerUp);
  anim.onComplete = onAnimationComplete;
  app.ticker.add(() => {
    light.rotation += 0.02;
    light2.rotation += 0.01;
    light.scale.x = 1 + Math.sin(count) * 0.04;
    light.scale.y = 1 + Math.cos(count) * 0.04;
    light2.scale.x = 1 + Math.sin(count) * 0.1;
    light2.scale.y = 1 + Math.cos(count) * 0.1;
    count += 0.01;
  });
  let initialPoint;
  let finalPoint;
  let played = false;

  function onAnimationComplete() {
    if (played) return;
    drumRoll.pause();
    fanfare.play();
    played = true;
  }
  function onPointerDown({ global: { x, y } }) {
    initialPoint = { x, y };
  }

  function onPointerUp({ global: { x, y } }) {
    finalPoint = { x, y };
    if (detectSwipeDown(initialPoint, finalPoint) && !played) {
      anim.play();
      drumRoll.play();
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
