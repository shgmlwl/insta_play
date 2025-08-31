// ===== js/heart-photos.js =====
(() => {
  const thumb_photo = [
    "image/play/play_01.jpeg",
    "image/play/play_02.jpeg",
    "image/play/play_03.jpeg",
    "image/play/play_04.jpeg",
    "image/play/play_05.jpeg",
    "image/play/play_06.jpeg",
    "image/play/play_07.jpeg",
    "image/play/play_08.jpeg",
    "image/play/play_09.jpeg",
    "image/play/play_10.jpeg",
    "image/play/play_11.jpeg",
    "image/play/play_12.jpeg",
    "image/play/play_13.jpeg",
    "image/play/play_15.jpeg",
    "image/play/play_16.jpeg",
    "image/play/play_17.jpeg",
    "image/play/play_18.jpeg",
    "image/play/play_19.jpeg",
    "image/play/play_20.jpeg",
    "image/play/play_21.jpeg",
    "image/play/play_22.jpeg",
    "image/play/play_23.jpeg",
    "image/play/play_24.jpeg",
    "image/play/play_25.jpeg",
    "image/play/play_26.jpeg",
    "image/play/play_27.jpeg",
    "image/play/play_28.jpeg",
    "image/play/play_29.jpeg",
    "image/play/play_30.jpeg",
    "image/play/play_31.jpeg",
    "image/play/play_32.jpeg",
    "image/play/play_33.jpeg",
    "image/play/play_34.jpeg",
    "image/play/play_35.jpeg",
    "image/play/play_36.jpeg",
    "image/play/play_37.jpeg",
    "image/play/play_38.jpeg",
    "image/play/play_39.jpeg",
    "image/play/play_40.jpeg",
    "image/play/play_41.jpeg",
    "image/play/play_42.jpeg",
    "image/play/play_43.jpeg",
    "image/play/play_44.jpeg",
    "image/play/play_45.jpeg",
    "image/play/play_46.jpeg",
    "image/play/play_47.jpeg",
    "image/play/play_48.jpeg",
    "image/play/play_49.jpeg",
    "image/play/play_50.jpeg",
    "image/play/play_51.jpeg",
  ];

  let thumbs = []; // p5.Image[]
  let squares = []; // falling photo particles

  const GRAVITY = 0.6;
  const AIR = 0.99;
  const BOUNCE = 0.7;

  // p5 전역 준비될 때까지 대기
  function waitP5Ready(cb) {
    if (
      typeof window.loadImage === "function" &&
      typeof window.random === "function" &&
      typeof window.createCanvas === "function"
    )
      cb();
    else setTimeout(() => waitP5Ready(cb), 30);
  }

  waitP5Ready(() => {
    // 1) 썸네일 비동기 로드
    thumb_photo.forEach((src) => {
      window.loadImage(
        src,
        (img) => thumbs.push(img),
        () => console.warn("[thumb FAIL]", src)
      );
    });

    // 2) 하트 클릭 → 사진 생성
    const heart = document.querySelector("#heart_icon");
    heart?.addEventListener("click", () => {
      if (!thumbs.length) return;

      // 15% 확률로 대폭발, 35% 중간, 50% 소량
      const r = Math.random();
      const n =
        r < 0.15
          ? Math.floor(window.random(18, 28))
          : r < 0.5
          ? Math.floor(window.random(8, 14))
          : Math.floor(window.random(3, 7));
      spawnSquares(n, { fromTop: true });
    });

    // 3) 파티클 생성
    function spawnSquares(n = 10, opt = { fromTop: true }) {
      const W = window.width ?? window.innerWidth;
      const H = window.height ?? window.innerHeight;

      for (let i = 0; i < n; i++) {
        const timg = thumbs.length ? window.random(thumbs) : null;

        const startX = opt.fromTop
          ? window.random(W * 0.1, W * 0.9)
          : W / 2 + window.random(-40, 40);
        const startY = opt.fromTop ? window.random(60, 160) : H - 60;

        const initVX = opt.fromTop
          ? window.random(-2.5, 2.5)
          : window.random(-4, 4);
        const initVY = opt.fromTop
          ? window.random(2, 6)
          : window.random(-11, -6);

        squares.push({
          x: startX,
          y: startY,
          vx: initVX,
          vy: initVY,
          size: window.random(62, 120),
          rot: window.random(window.TWO_PI),
          rotv: window.random(-0.12, 0.12),
          img: timg,

          // 바닥후 제거 타이머용 상태
          touchFrame: null, // 최초 바닥 터치한 frameCount
          lifetimeAfterTouch: 72, // 바닥 닿은 뒤 유지할 프레임 수 (3초 @ 60fps)
        });
      }
    }

    // 4) 업데이트/렌더
    function drawSquares() {
      for (let i = squares.length - 1; i >= 0; i--) {
        const s = squares[i];

        // 물리
        s.vy += GRAVITY;
        s.vx *= AIR;
        s.vy *= AIR;
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.rotv;

        // 바닥 충돌
        const bottom = window.height - 6;
        if (s.y + s.size / 2 > bottom) {
          s.y = bottom - s.size / 2;
          s.vy *= -BOUNCE;
          s.vx *= 0.9;

          // ⬇️ 최초 바닥 터치 시점 기록
          if (s.touchFrame === null) {
            s.touchFrame = window.frameCount;
          }
        }

        // 바닥에 닿은 뒤 경과 시간 계산
        let alpha = 255;
        if (s.touchFrame !== null) {
          const elapsed = window.frameCount - s.touchFrame; // 바닥 닿은 뒤 경과 프레임
          // 마지막 30프레임 동안만 페이드아웃
          const fadeFrames = 10;
          const killAt = s.lifetimeAfterTouch;
          if (elapsed >= killAt) {
            squares.splice(i, 1);
            continue;
          } else if (elapsed >= killAt - fadeFrames) {
            const t = (killAt - elapsed) / fadeFrames; // 1 → 0
            alpha = Math.max(0, Math.min(255, Math.floor(255 * t)));
          }
        }

        // 렌더
        window.push();
        window.translate(s.x, s.y);
        window.rotate(s.rot);
        window.imageMode(window.CENTER);
        if (s.img) {
          window.tint(255, alpha);
          window.image(s.img, 0, 0, s.size, s.size);
          window.noTint();
        } else {
          window.stroke(0, alpha);
          window.fill(30, 30, 30, alpha);
          window.rectMode(window.CENTER);
          window.rect(0, 0, s.size, s.size, 8);
        }
        window.pop();

        // 화면 아주 아래로 완전히 나간 경우도 안전 제거
        if (s.y - s.size / 2 > window.height + 200) {
          squares.splice(i, 1);
        }
      }
    }

    // 5) 기존 p5 draw에 덧붙이기
    (function attachToDraw() {
      function tryWrap() {
        const prev = window.draw;
        if (typeof prev === "function") {
          if (prev.__wrapped) return true;
          const wrapped = function () {
            prev();
            drawSquares();
          };
          wrapped.__wrapped = true;
          window.draw = wrapped;
          return true;
        } else {
          window.draw = function () {
            window.background(255);
            drawSquares();
          };
          window.draw.__wrapped = true;
          return true;
        }
      }
      if (tryWrap()) return;
      const id = setInterval(() => {
        if (tryWrap()) clearInterval(id);
      }, 10);
      window.addEventListener("load", tryWrap, { once: true });
    })();
  });
})();
/* x클릭시 메인 페이지로 넘어가기 */
const close_icon = document.querySelector("#close_icon");
console.log(close_icon);
close_icon.addEventListener("click", () => {
  location.href = "/main.html";
});
