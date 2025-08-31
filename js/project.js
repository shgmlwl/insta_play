document.addEventListener("DOMContentLoaded", () => {
  /* 시간에 따른 하늘 배경 설정 */
  const clock = document.querySelector("#clock");
  const date = document.querySelector("#date");
  const pm = document.querySelector("#pm");

  /* 두개의 iframe태그를 만들어서 자연스럽게 fade되어 보이게 => 이 방법이 효율적임 */
  const sky_frame_1 = document.querySelector("#sky_frame_1");
  const sky_frame_2 = document.querySelector("#sky_frame_2");
  const layers = [sky_frame_1, sky_frame_2];
  let active = 0;
  let current_1 = null;

  //시간대별 html 파일 설정 =>배열,객체
  const time_background = [
    { id: "sky", html: "sky.html", range: [6, 17] },
    { id: "sky_dark", html: "sky_dark.html", range: [17, 20] },
    { id: "night", html: "night.html", range: [20, 24] },
    { id: "dawn", html: "sky_dark.html", range: [0, 6] },
  ];
  const pick_slot = (h) =>
    time_background.find((s) => h >= s.range[0] && h < s.range[1]);

  /* 옵션 */
  const follow_fake = true;
  const force_bg = null;
  const clock_mode = "random";
  //최초 1회 쵝화 : 한 레이어만 보이게  + src 세팅
  (function initFirst() {
    const h = new Date().getHours();
    const first = (
      force_bg ? time_background.find((s) => s.id === force_bg) : pick_slot(h)
    ).html;

    layers[active].src = first;
    layers[active].style.opacity = 1;
    current = first;
  });

  /* 배경 페이드 기법 => 랜덤으로 시간이 나왔을 때 자연스럽게 겹쳐지면서 나오게 배경이 */
  function fading(src) {
    if (current === src) return;
    const now = layers[active];
    const next = layers[1 - active];

    //다음 배경을 미리 로드
    next.onload = () => {
      next.style.opacity = 1; //보이게
      now.style.opacity = 0; //숨겨
      active = 1 - active; //활성 레이어 교체
      current_1 = src;
      next.onload = null;
    };
    if (next.src !== src) next.src = src;
    else next.onload?.();
  }

  //가짜 시계
  let t = new Date();
  let current = null;
  /* 시간이 바뀔 때 자연스럽게 하기 위해서 */

  function tick() {
    const real = new Date();
    const month = String(real.getMonth() + 1).padStart(2, "0");
    const day = String(real.getDate()).padStart(2, "0");
    const weekday = new Intl.DateTimeFormat("ko-KR", {
      weekday: "short",
      timeZone: "Asia/Seoul",
    }).format(real);
    if (date) date.textContent = `${month}월${day}일 (${weekday})`;

    //시계만 불규칙하게
    let h24, mm;
    if (clock_mode === "random") {
      const fake_m = Math.floor(Math.random() * 1440);
      h24 = Math.floor(fake_m / 60);
      mm = String(fake_m % 60).padStart(2, "0");
    } else {
      const r = Math.random();
      const delta_min =
        r < 0.1
          ? Math.random() < 0.5
            ? -14
            : 14 //10프로 큰 점프
          : r < 0.6
          ? Math.random() < 0.5
            ? -2
            : 2 //50프로 큰 점프
          : 1; //나머지 +1분
      t = new Date(t.getTime() + delta_min * 60 * 1000); //분
      h24 = t.getHours();
      mm = String(t.getMinutes()).padStart(2, "0");
    }

    const am_pm = h24 >= 12 ? "오후" : "오전";
    const h12 = String(h24 % 12 || 12).padStart(2, "0");
    if (pm) pm.textContent = am_pm;
    if (clock) clock.textContent = `${h12} : ${mm}`; //불규칙하게

    // 배경은 실제 시간 기준으로만
    let slot;

    if (force_bg) {
      slot = time_background.find((s) => s.id === force_bg);
    } else if (follow_fake) {
      slot = pick_slot(h24); //가짜 시계 기준으로 배경도 바뀜
    } else {
      slot = pick_slot(real.getHours());
    }
    if (!slot) return;
    const next_key = slot.html;
    if (current !== next_key) {
      fading(next_key); //여기서 페이드 전환
    }
  }
  tick();
  setInterval(tick, 5500);

  // rotation interation
  const cube_sel = document.querySelector(".cube");
  if (!cube_sel || !window.gsap) return;

  // 각도 상태
  let rotation_x = 0;
  let rotation_y = 0;
  gsap.set(cube_sel, { rotateX: rotation_x, rotateY: rotation_y });

  // 드래그 상태
  let start_x = 0,
    start_y = 0,
    drag = false,
    moved = false;
  let base_x = 0,
    base_y = 0; // ← 초기화 꼭!

  // 최근 이동량(업에서 필요)
  let dx = 0,
    dy = 0;

  const tt = 12; // 드래그 판정 임계값(px)
  const tl = gsap.timeline({
    repeat: -1,
    yoyo: true,
    defaults: { duration: 2, ease: "power2.inOut" },
  });
  tl.to(cube_sel, {
    rotateY: 45,
  });

  cube_sel.addEventListener("pointerdown", (e) => {
    drag = true;
    moved = false;
    start_x = e.clientX;
    start_y = e.clientY;
    base_x = rotation_x;
    base_y = rotation_y; // ← Y 기준값도 저장
    gsap.killTweensOf(cube_sel);
  });

  cube_sel.addEventListener("pointermove", (e) => {
    if (!drag) return;
    dx = e.clientX - start_x;
    dy = e.clientY - start_y;

    if (!moved && (Math.abs(dx) > tt || Math.abs(dy) > tt)) {
      moved = true;
    }

    // 드래그 중 자유 회전 (X는 마우스 Y 반대, Y는 마우스 X 정방향)
    rotation_x = base_x - dy * 0.5;
    rotation_y = base_y + dx * 0.5;
    gsap.set(cube_sel, { rotateX: rotation_x, rotateY: rotation_y });
  });

  cube_sel.addEventListener("pointerup", (e) => {
    if (!drag) return;
    drag = false;

    // 클릭 판정(거의 안 움직임)
    if (!moved) {
      const link = e.target.closest("a");
      if (link) {
        link.click();
      }
      tl.play();
    }

    // 각도 정규화(선택)
    rotation_x = ((rotation_x % 360) + 360) % 360;
    rotation_y = ((rotation_y % 360) + 360) % 360;

    rotation_x = Math.max(-65, Math.min(65, rotation_x));
  });

  // 드래그 취소 대비
  cube_sel.addEventListener("pointercancel", () => {
    drag = false;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector("#img_collect"); // 마우스 추적 영역
  const cubes = document.querySelectorAll(".cube_c");
  const tag = document.getElementById("follow_tag");

  const hashtags = {
    cube_1: "#집 가는길 #파란 하늘 #옛날 미용실",
    cube_2: "#여행 #제주도 #바다 #풍경 #힐링",
    cube_3: "#전주 여행 #노래방 #친구 #맛집투어",
    cube_4: "#카페 #커피 #성수동 #친구와 함께",
    cube_5: "#일본여행 #맛집 #거리풍경 #디즈니랜드 #도쿄타워",
    cube_6: "#전시 #사진 #아트워크",
  };

  // 마우스 좌표를 부드럽게 갱신 (rAF로 성능 확보)
  let mx = 0,
    my = 0,
    raf = null;
  function updatePos() {
    tag.style.left = mx + "px";
    tag.style.top = my + "px";
    raf = null;
  }
  container.addEventListener("mousemove", (e) => {
    mx = e.clientX; // viewport 기준 좌표 (position:fixed와 짝)
    my = e.clientY;
    if (!raf) raf = requestAnimationFrame(updatePos);
  });

  // 각 썸네일 hover시 표시/해제
  cubes.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      tag.textContent = hashtags[el.id] || "";
      tag.classList.add("show");
    });
    el.addEventListener("mouseleave", () => {
      tag.classList.remove("show");
      tag.textContent = "";
    });
  });

  // 터치 기기 대응(길게 누르면 보이고 떼면 숨김)
  container.addEventListener(
    "touchstart",
    (e) => {
      const t = e.target.closest(".cube_c");
      if (!t) return;
      const touch = e.touches[0];
      mx = touch.clientX;
      my = touch.clientY;
      updatePos();
      tag.textContent = hashtags[t.id] || "";
      tag.classList.add("show");
    },
    { passive: true }
  );
  container.addEventListener("touchend", () => tag.classList.remove("show"));
});
