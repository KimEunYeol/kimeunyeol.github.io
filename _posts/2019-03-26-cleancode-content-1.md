---
title:        "CleanCode - A meaningful naming(1)-수정중"
description:  "소프트웨어에서 이름은 어디에나 쓰인다, 이렇듯 이름을 잘 지으면 여러모로 편하다. 이번 포스팅에서는 이름을 잘 짓는 간단한 규칙을 몇 가지 소개하고자 한다"
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

본 포스팅은 Clean Code: A Handbook of Agile Software Craftsmanship (Robert C. Martin Series)에 기반한 내용이며 수록된 코드 및 참고문헌을 인용하였습니다.
