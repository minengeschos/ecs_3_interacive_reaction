let circles = []; // 원의 좌표를 저장할 배열

let video; // 비디오 캡처 객체
let handPose; // 손 인식 모델
let hands = []; // 감지된 손 정보를 저장할 배열

// 손 인식 모델을 미리 로드
function preload() {
  handPose = ml5.handPose({ flipped: true }); // 손 인식 모델 초기화 (좌우 반전)
}

// 마우스를 클릭했을 때 원 배열 초기화
function mousePressed() {
  circles = [];
}

// 손 인식 결과를 처리하는 콜백 함수
function gotHands(results) {
  hands = results; // 감지된 손 정보를 업데이트
}

// 초기 설정을 수행하는 함수
function setup() {
  createCanvas(640, 480); // 캔버스 크기 설정

  video = createCapture(VIDEO, { flipped: true }); // 비디오 캡처 시작 (좌우 반전)
  video.hide(); // 비디오 요소 숨기기

  handPose.detectStart(video, gotHands); // 손 인식 시작

  noStroke(); // 기본적으로 윤곽선을 없앰
}

// 매 프레임마다 호출되는 함수
function draw() {
  
  image(video, 0, 0); // 비디오를 캔버스에 그리기

  // 최소 한 손이 감지되었는지 확인
  if (hands.length > 0) {
    let hand = hands[0]; // 첫 번째 손 정보 가져오기
    let index = hand.index_finger_tip; // 검지 끝 좌표 가져오기
    let middle = hand.middle_finger_tip; // 중지 끝 좌표 가져오기
    let thumb = hand.thumb_tip; // 엄지 끝 좌표 가져오기

    // 검지와 중지 사이의 거리 계산
    let distance = dist(index.x, index.y, middle.x, middle.y);

    // 거리가 20픽셀 이하일 때만 검지 끝 좌표를 circles 배열에 추가
    if (distance <= 20) {
      circles.push({ x: index.x, y: index.y });
    } else {
      circles.push(null); // 거리가 20픽셀 이상일 때 null 추가
    }
    
    // 엄지와 중지 사이의 거리 계산
    let thumbMiddleDistance = dist(thumb.x, thumb.y, middle.x, middle.y);

    // 엄지와 중지 사이의 거리가 15픽셀 이하일 때
    if (thumbMiddleDistance <= 15) {
      // 지워진 위치를 저장할 배열
      let clearedPositions = [];
      clearedPositions.push({ x: thumb.x, y: thumb.y });

      // clearedPositions에 저장된 위치와 가까운 circles의 점 제거
      circles = circles.filter(circle => {
      if (circle === null) return true;
      return !clearedPositions.some(pos => dist(circle.x, circle.y, pos.x, pos.y) <= 10);
      });

      // 지워질 위치에 9픽셀의 검은색 원을 투명도 50%로 표시
      clearedPositions.forEach(pos => {
      fill(0, 0, 0, 127); // 검은색, 투명도 50%
      noStroke();
      ellipse(pos.x, pos.y, 15, 15); // 9픽셀 원 그리기
      });

    }
    
    
    // circles 배열에 저장된 좌표를 이어 선 그리기 (좌우 반전 포함)
    for (let i = 1; i < circles.length; i++) {
      const prev = circles[i - 1]; // 이전 점
      const curr = circles[i]; // 현재 점
      if (prev === null || curr === null) continue; // 선 끊기
      strokeWeight(2); // 선 두께
      stroke(0); // 검은색 선
      line(prev.x, prev.y, curr.x, curr.y); // 선 그리기
    }
    
    
  }
  // 손이 2개 이상 감지되었을 때
  if (hands.length > 1) {
    // 양손의 엄지와 중지가 모두 만나있는지 확인
    let leftThumbMiddleDistance = dist(hands[0].thumb_tip.x, hands[0].thumb_tip.y, hands[0].middle_finger_tip.x, hands[0].middle_finger_tip.y);
    let rightThumbMiddleDistance = dist(hands[1].thumb_tip.x, hands[1].thumb_tip.y, hands[1].middle_finger_tip.x, hands[1].middle_finger_tip.y);

    if (leftThumbMiddleDistance <= 15 && rightThumbMiddleDistance <= 15) {
      circles = []; // 모든 선 지우기
    }
    let edgeThreshold = 150; // 화면 가장자리에서 100픽셀 이내

    // 화면 좌상단
    if (hands[0].index_finger_tip.x < edgeThreshold && hands[0].index_finger_tip.y < edgeThreshold) {
      // 좌상단 기능 실행 (추후 구현)
      fill(0); // 검은색 텍스트
      textSize(32); // 텍스트 크기 설정
      text('안녕하세요', 10, 40); // 화면 좌상단에 텍스트 출력
      // TODO: Implement top-left corner functionality
    }

    // 화면 좌하단
    if (hands[0].index_finger_tip.x < edgeThreshold && hands[0].index_finger_tip.y > height - edgeThreshold) {
      // 좌하단 기능 실행 (추후 구현)
      fill(0); // 검은색 텍스트
      textSize(32); // 텍스트 크기 설정
      textSize(128); // 텍스트 크기 설정 (4배로 키움)
      text('😊', 10, height - 40); // 화면 좌하단에 웃는 얼굴 이모티콘 출력 (위치 조정)
      // TODO: Implement bottom-left corner functionality
    }

    // 화면 우상단
    if (hands[0].index_finger_tip.x > width - edgeThreshold && hands[0].index_finger_tip.y < edgeThreshold) {
      // 우상단 기능 실행 (추후 구현)
      fill(0); // 검은색 텍스트
      textSize(128); // 텍스트 크기 설정 (4배로 키움)
      text('🙋', width - 150, 140); // 화면 우상단에 손드는 이모지 출력 (위치 조정)
      // TODO: Implement top-right corner functionality
    }

    // 화면 우하단
    if (hands[0].index_finger_tip.x > width - edgeThreshold && hands[0].index_finger_tip.y > height - edgeThreshold) {
      // 우하단 기능 실행 (추후 구현)
      fill(0); // 검은색 텍스트
      textSize(32); // 텍스트 크기 설정
      text('수고하셨습니다', width - 250, height - 40); // 화면 우하단에 텍스트 출력
      // TODO: Implement bottom-right corner functionality
    }
  }
}
