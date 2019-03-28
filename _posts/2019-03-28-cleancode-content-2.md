---
title:        "CleanCode - 2. Function"
description:  ""
image:        "http://placehold.it/400x200"
author:       "KimEunYeol"
---

이름의 의도를 분명히 하자
-----------

내가 만든 변수혹은 클래스가 아래 질문에 모두 대답 할 수 있는지 확인 해보자
* Q. 존재 이유는?
* Q. 수행 기능은?
* Q. 사용 방법은?

만약 주석이 필요하다면 의도가 분명하지 못하다는것을 반증한다

그렇다면 코드를 통해 나쁜 예와 좋은 예를 살펴보도록 하자

#### bad example

~~~java
public List<int[]> getThem(){
	List<int[]> list1 = new ArrayList<intp[]>;
    for(int[] x : theList)
    	if(x[] == 4)
        	list1.add(x);
        return list1;
}
~~~

위 코드에서 문제는 다음과 같다
1. theList이 어떤 정보를 가지는지 
2. theList에서 0번째 값이 왜 사용되는지
3. 값 4는 무엇을 의미하는지
4. 함수가 반환하는 리스트 list1을 어떻게 사용하는지

위 코드를 지뢰찾기 게임을 배경으로 수정해보겠다
#### good example
~~~java
public List<int[]> getFlaggedCells(){
	List<int[]> flaggedCells = new ArrayList<intp[]>;
    for(int[] x : gameBoard)
    	if(cell[STATUS_VALUE] == FLAGGED)
        	flaggedCells.add(cell);
        return flaggedCells;
}
~~~

여기서 좀 더 나아가 int배열을 사용하는 대신 클래스로 만들고 명시적인 함수와 상수를 추가해보겠다
#### very good example
~~~java
public List<Cell> getFlaggedCells(){
	List<Cell> flaggedCells = new ArrayList<Cell>;
    for(Cell cell : gameBoard)
    	if(cell.isFlagged())
        	flaggedCells.add(cell);
        return flaggedCells;
}
~~~
단순히 이름만 바꿨을 뿐인데 가독성이 훨씬 좋아졌다:)

그릇된 정보를 피하고 의미있게 구분하자
-------------------
유사한 의미의 단어 혹은 동음 다의어나 간단한 약어들을 구분하기 위해서는 나만의 기준이 생길수 밖에 없다 이러한 나만의 기준은 코드의 복잡성을 증대시킬 뿐이다
 * ex) accountList, accountGroup, bunchOfAccounts 혹은 handlingString, StorageString

불용어를 추가한 이름 역시 아무런 정보를 제공하지 못한다
  * ex 1) ProductInfo, ProductData 과 같이 개념을 구분하지 않은채 이름만 달라지는 경우
  * ex 2) GetActiveAccount();, GetActiveAccounts();, GetActiveAccountinfo();

상수는 검색하기 쉽게 알맞은 텍스트로 선언하자
-------------------
 * ex) WORK_DAYS_PER_WEEK, MAX_CLASSED_PER_STUDENT

클래스와 메서드 그리고 인터페이스 구조
-------------------
1. 클래스
  * 클래스의 이름과 객체 이름은 명사나 명사구가 적합하다
  * 좋은 예로는 Customer, WikiPage, Account, AddressPaser
  * 나쁜 예로는 Manager, Processor, Data, Info 등

2. 메서드
  * 메서드 이름은 동사나 동사구가 적합하다
  * 접근자, 변경자, 조건자는 표준에 따라 앞에 get, set, is 를 붙인다
  * 생성자를 오버로딩 할 때는 정적 팩토리 메서드를 사용한다
    * ex) Complex fulcrumPoint = Complex.FromRealNumber(23.0); // 메서드는 인수를 설명하는 이름을 사용한다

3. 인터페이스
  * 인터페이스 클래스라고 앞에 'I'같은 접두어를 붙이지 말자
  * 허나 꼭 인코딩이 필요하다면 뒤에 'Imp'를 붙이거나 앞에 'C'를 붙이는게 더 좋다

앞의 모든 명명 규칙중에서도 '한 개념에 한 단어 사용'이 지켜져야 일관성 있는 맥락의 코드가 완성된다

의미있는 맥락과 불필요한 맥락
-------------------
#### 맥락이 불분명한 변수
~~~java
private void printGuessStratistics(char candidate, int count)
	String number;
    String verb;
    String pluraModifier;
    if(count == 0){
    	number = "no";
        verb = "are";
        pluralModifier = "s";
    }
    else if(count == 1){
    	number = "1";
        verb = "is";
        pulraModifier = "";
    } else {
    	number = Integer.toString(count);
        verb = "are";
        pluraModifier = "s";
    }
    String guessMessage = String.format(
    	"There %s %s %s%s", verb, number, cadidate, pluralModifier
	);
	print(guessMessage);
}
~~~

세 변수를 함수 전반에서 사용한다 이 변수들을 클래스를 만들어 관리하면 맥락이 분명해질 뿐더러 이렇게 맥락을 개선하면 함수를 쪼개기가 쉬워진다

#### 맥락이 분명한 변수
~~~java
public class GuessStratisticsMessage{
	private String number;
    private String verb;
    private String pluraModifier;
    
    public String makee(char candidate, int count){
    	createPluraDependentMessageParts(count);
        return String.format(
        	"There %s %s %s%s", verb, number, cadidate, pluralModifier
        );
    }
    private void createPluralDependentMessageParts(int count){
    	if(count == 0){
        	thereAreNoLetters();
        } else if(count == 1){
        	thereisOneLetter();
        } else {
        	thereAreManyLetters(count)
        }
    }
    private void thereAreManyLetters(int count){
    	number = Integer.toString(count);
        verb = "are";
        pluraModifier = "s";
    }
    private void thereisOneLetter(){
        number = "1";
        verb = "is";
        pulraModifier = "";
    }
    private void thereAreNoLetters(){
		number = "no";
        verb = "are";
        pluralModifier = "s";
    }
}
~~~







본 포스팅은 Clean Code: A Handbook of Agile Software Craftsmanship (Robert C. Martin Series)에 기반한 내용이며 수록된 코드 및 참고문헌을 인용하였습니다.