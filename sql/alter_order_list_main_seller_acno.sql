-- ORDER_LIST_MAIN 에 주문 시점의 입금 계좌를 보관한다.
--
-- 지금까지 마이페이지/주문완료 화면은 SELLER 의 현재 계좌를 그때그때 읽어
-- 보여줬기 때문에, 판매자가 계좌를 바꾸면 과거 주문에도 바뀐 계좌가 보였다.
-- 주문 시점의 값을 주문 행에 함께 저장해 두면 그런 일이 생기지 않는다.
--
-- 애플리케이션 배포 전에 반드시 먼저 실행해야 한다 (없으면 주문 INSERT 가 실패한다).

ALTER TABLE ORDER_LIST_MAIN
    ADD COLUMN SELLER_ACNO              VARCHAR(100) NULL DEFAULT NULL AFTER SELLER_NO,
    ADD COLUMN SELLER_DEPOSIT_PERSON_NM VARCHAR(100) NULL DEFAULT NULL AFTER SELLER_ACNO;

-- 기존 주문은 해당 판매자의 현재 계좌로 채워둔다.
UPDATE ORDER_LIST_MAIN A, SELLER B
   SET A.SELLER_ACNO = B.ACNO
     , A.SELLER_DEPOSIT_PERSON_NM = B.DEPOSIT_PERSON_NM
 WHERE A.SELLER_NO = B.SELLER_NO
   AND A.SELLER_ACNO IS NULL;
