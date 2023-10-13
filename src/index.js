const canvasContainer = document.createElement("div");
canvasContainer.classList.add("canvas-container");

document.body.appendChild(canvasContainer);

const app = new PIXI.Application({
  backgroundAlpha: 0,
  resizeTo: canvasContainer,
});
canvasContainer.appendChild(app.view);

// prepare circle texture, that will be our brush
const brush = new PIXI.Graphics()
  .beginFill(0xffffff)
  .drawRect(-(1000 / 2), -50, 1000, 50);

// Create a line that will interpolate the drawn points
const line = new PIXI.Graphics();

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
  src: "../public/assets/foil.jpg",
});
PIXI.Assets.add({
  alias: "t4",
  src: "../public/assets/foil_texture.json",
});
PIXI.Assets.load(["t1", "t2", "t3", "t4"]).then(setup);

function setup() {
  const { width, height } = app.screen;
  const stageSize = { width, height };
  const spriteSettings = {
    width,
    height: width * 0.75,
    y: height / 2,
    x: width / 2,
  };

  globalThis.__PIXI_APP__ = app;

  const frames = [];
  for (let i = 0; i < 4; i++) {
    frames.push(PIXI.Texture.from(`foil${i + 1}.png`));
  }

  // draw polygon
  const path = [
    0, 70, 35, 0, 75, 0, 95, 35, 120, 25, 100, 0, 130, 0, 150, 25, 150, 50, 130,
    75, 115, 150, 75, 150, 45, 125, 0, 150, 0, 130, 35, 75,
  ];

  const foilContainer = new PIXI.Container();
  for (let i = 0; i < 10; i++) {
    const polygon = new PIXI.Graphics();
    polygon.lineStyle(0);
    polygon.beginFill(0x3500fa, 1);
    polygon.drawPolygon(path);
    polygon.endFill();
    polygon.position.set(-75, -75);
    const anim = new PIXI.AnimatedSprite(frames);
    anim.position.set(i * 30, 0);
    anim.scale.set(0.35);
    anim.anchor.set(0.5);
    anim.angle = Math.random() * 360;
    anim.animationSpeed = 0.3;
    anim.mask = polygon;
    anim.addChild(polygon);
    foilContainer.addChild(anim);
  }

  const background = Object.assign(PIXI.Sprite.from("t1"), spriteSettings);
  background.anchor.set(0.5);
  const imageToReveal = Object.assign(PIXI.Sprite.from("t2"), spriteSettings);
  imageToReveal.anchor.set(0.5);
  const renderTexture = PIXI.RenderTexture.create(stageSize);
  const renderTextureSprite = new PIXI.Sprite(renderTexture);

  imageToReveal.mask = renderTextureSprite;

  app.stage.addChild(
    background,
    imageToReveal,
    renderTextureSprite,
    foilContainer
  );

  app.stage.eventMode = "static";
  app.stage.hitArea = app.screen;
  app.stage
    .on("pointerdown", pointerDown)
    .on("pointerup", pointerUp)
    .on("pointerupoutside", pointerUp)
    .on("pointermove", pointerMove);

  const screenMiddle = app.stage.width / 2;
  let dragging = false;
  let playing = false;
  let lastDrawnPoint = new PIXI.Point();
  lastDrawnPoint.set(screenMiddle, height / 2 - background.height / 2);
  foilContainer.position.set(lastDrawnPoint.x - 150, lastDrawnPoint.y + 25);
  console.log(imageToReveal);

  function pointerMove({ global: { x, y } }) {
    if (dragging) {
      if (y < lastDrawnPoint.y + 25) {
        brush.position.set(screenMiddle, y);
        app.renderer.render(brush, {
          renderTexture,
          clear: false,
          skipUpdateTransform: false,
        });
      }
      if (y < lastDrawnPoint.y + 25 && lastDrawnPoint.y < y) {
        if (!playing)
          foilContainer.children.forEach((element) => element.play());
        lastDrawnPoint.set(screenMiddle, y);
        foilContainer.position.set(lastDrawnPoint.x - 150, y + 25);
      }
    }
  }

  function pointerDown(event) {
    dragging = true;
    pointerMove(event);
  }

  function pointerUp(event) {
    dragging = false;
    playing = false;
    foilContainer.children.forEach((element) => element.stop());
  }
}
