# Style Guide

## Содержание

- [HTML](#html)
- [ACCESSIBILITY](#accessibility)
- [SCSS](#scss)
- [TYPESCRIPT](#ts)
- [TESTING](#testing)

---

## HTML


- Повторяющиеся элементы
    - Перенесите в отдельные компоненты:
        - Если это независимый элемент, такой как форма, таблица, карточка и т.д.
        - Если это большой блок кода, который повторяется в разных местах.
    - Используйте `ng-template`:
        - Если это маленький блок кода, который повторяется в разных местах, но он не является независимым элементом.

---

- Если несколько тегов находятся внутри одного родительского тега, каждый из этих тегов должен быть разделен пустой
  строкой. Однострочные теги можно не разделять.

Неправильно:

```html
<div class="flex flex-row mt-3">
    <div class="flex flex-row align-self-stretch w-full wrapper-client-base">
        <app-dashboard-client-base [clients]="clientGroups"/>
    </div>
    <div class="flex flex-row w-full align-self-stretch">
        <app-site-visitors-table [clients]="clientGroups"/>
        <app-available-communications-canals-table [data]="communicationCanalsData"/>
    </div>
</div>
<div class="flex flex-row mt-3">
    <div class="flex flex-row align-self-stretch w-full wrapper-client-base">
        <app-dashboard-client-base [clients]="clientGroups"/>
    </div>
</div>
```

Правильно:

```html
<div class="flex flex-row mt-3">
    <div class="flex flex-row align-self-stretch w-full wrapper-client-base">
        <app-dashboard-client-base [clients]="clientGroups"/>
    </div>

    <div class="flex flex-row w-full align-self-stretch">
        <app-site-visitors-table [clients]="clientGroups"/>
        <app-available-communications-canals-table [data]="communicationCanalsData"/>
    </div>
</div>

<div class="flex flex-row mt-3">
    <div class="flex flex-row align-self-stretch w-full wrapper-client-base">
        <app-dashboard-client-base [clients]="clientGroups"/>
    </div>
</div>
```
---

- Если у тега больше одного атрибута, каждый из атрибутов следует расположить на отдельной строке.

Неправильно:

```html
<app-site-visitors-table class="flex flex-row w-full align-self-stretch" [clients]="clientGroups"/>
```

Правильно:

```html
<app-site-visitors-table
    class="flex flex-row w-full align-self-stretch"
    [clients]="clientGroups"
/>
```

---

- Порядок атрибутов в тегах:
    - Ссылки на шаблон (template reference);
    - Структурные директивы (structural directives);
    - Класс (class);
    - Параметры (parameters);
    - Двунаправленные связи (two-way bindings);
    - Обработчики событий (event handlers).

```angular2html
<div
    #templateRef
    *ngIf="isVisible"
    class="dynamic-class"
    [title]="'Dynamic Title'"
    [attr.data-custom]="customAttribute"
    [(ngModel)]="userInput"
    (input)="onInputChange($event)"
>
    <a [routerLink]="['/home']">Home</a>
</div>
```

---

- Вложенность элементов должна быть каскадной.

Неправильно:

```html
  <app-site-visitors-table [clients]="clientGroups"><span>Hello</span></app-site-visitors-table>
```

Правильно:

```html
<app-site-visitors-table [clients]="clientGroups">
    <span>Hello</span>
</app-site-visitors-table>
```

---

- Используйте `ng-container` для условной отрисовки, когда создание тега обусловлено только необходимостью использования
  директивы ngIf, а не потребностями верстки.

Правильно:

```angular2html
<ng-container *ngIf="isShow">
    <div class="flex flex-row align-items-center gap-3">
        ...
    </div>
</ng-container>
```

Неправильно, тут div нужен только для ngIf:

```angular2html
<div *ngIf="isShow">
    <div class="flex flex-row align-items-center gap-3">
        ...
    </div>
</div>
```

Правильно, div используется еще и для стилизации:

```angular2html
<div
    *ngIf="isShow"
    class="flex flex-row align-items-center gap-3"
>
    <div class="flex flex-row align-items-center gap-3">
        ...
    </div>

    <div class="flex flex-row align-items-center gap-3">
        ...
    </div>
</div>
```

Правильно:

```angular2html
<my-component
    *ngIf="isShow"
    [data]="data"
/>
```
Неправильно, div используется только для ngIf:

```angular2html
<div *ngIf="isShow">
    <my-component [data]="data"/>
</div>
```

---

- Используйте самозакрывающийся тег для компонентов без содержимого.

Неправильно:

```angular2html
<my-component></my-component>
```

Правильно:

```angular2html
<my-component/>
```

---

- Используйте `trackBy` при использовании `*ngFor` для динамических коллекций.

Это позволяет Angular обновлять только изменившиеся элементы вместо полной перерисовки списка, что повышает производительность.

```angular2html
<div>
    <ul>
        <li *ngFor="let item of collection; trackBy: trackByFn">{{item.id}}</li>
    </ul>
</div>
```

```typescript
interface TestItem {
    id: number;
}

public trackByFn (index: number, item: TestItem): number {
    return item.id;
}
```

---

## ACCESSIBILITY

- Используйте семантические и интерактивные элементы правильно.
    - Используйте подходящие HTML-теги для их предназначения:
        - `<button>` - для кнопок
        - `<nav>` - для навигации
        - `<main>, <article>, <section>` - для структурирования контента
    - Не делайте неинтерактивные элементы (`<div>, <span>`) интерактивными через JavaScript.


Неправильно:
```html
<div class="btn" (click)="submit()">Отправить</div>
```

Правильно:
```html
<button type="button" (click)="submit()">Отправить</button>
```

---

- Все интерактивные элементы должны быть доступны с клавиатуры.

Если используется нестандартный элемент, необходимо добавить:

- `tabindex="0"`
- обработку `keydown`
- соответствующий `role`

---

- Все изображения должны иметь атрибут `alt`.

Для декоративных изображений используйте:

```html
<img
    src="..."
    alt=""
/>
```

---

- Все элементы формы должны быть связаны с `<label>`.

Неправильно:

```html
<input type="email">
```

Правильно:

```html
<label for="email">
    Email
</label>

<input
    id="email"
    type="email"
/>
```

---

- Для элементов без текстового содержимого добавляйте `aria-label`.

Правильно:

```html
<button
    type="button"
    aria-label="Close dialog"
>
    <app-icon-close/>
</button>
```

---

- Используйте `aria-expanded`, `aria-selected`, `aria-pressed`, `aria-hidden` только тогда, когда состояние элемента невозможно определить нативно.

---

- Не удаляйте outline у элементов, получающих фокус.

Неправильно:

```scss
button:focus {
    outline: none;
}
```

Правильно:

```scss
button:focus-visible {
    outline: 2px solid var(--primary);
}
```

---

- Используйте `:focus-visible` вместо `:focus` для отображения состояния фокуса.

---

- Не полагайтесь только на цвет для передачи информации.

Ошибки, предупреждения и успешные состояния должны сопровождаться текстом или иконкой.

---

- Используйте корректную иерархию заголовков (`h1 → h2 → h3`), не пропуская уровни.

---

- Используйте live-region (`aria-live`) только для действительно важных динамических сообщений (например, уведомлений или ошибок формы).

---

- Проверяйте контрастность текста и интерактивных элементов согласно WCAG AA.

---

- Проверяйте доступность с помощью инструментов:
    - В браузере: Используйте панель Accessibility в Chrome DevTools или плагины вроде axe DevTools для ручной проверки отдельных страниц и компонентов.
    - В коде/CI: Интегрируйте автоматизированные проверки, например, с помощью [a11y-shiftleft-cli](https://github.com/olboyarshinova/a11y-shiftleft-cli), чтобы находить проблемы на ранних этапах и предотвращать регрессии.

---

## SCSS


- Каждый класс должен быть отделён пустой строкой.

---

- Используйте вложенность не более 3 уровней.

---

- Избегайте `!important`. Если необходимо — добавьте комментарий.

---

- Используйте миксины/функции из `src/styles/` вместо дублирования значений.

---

- BEM-нейминг для изолированных компонентов: `.card__title`, `.card--featured`.

---

## TYPESCRIPT


- Для всех полей и методов класса должны быть указаны модификаторы доступа (public, private, protected).

---

- Порядок сущностей класса:
    - @Input;
    - @Output;
    - Другие декораторы (кроме тех, которые применяются к методам класса);
    - Публичные поля класса;
    - Приватные поля класса;
    - Конструктор;
    - Жизненные циклы (Lifecycle Hooks);
    - Методы класса.

---

- Порядок инжектирования в конструкторе:
    - Декораторы;
    - Публичные поля класса;
    - Приватные поля класса.

---

- В методах жизненного цикла (`Lifecycle Hooks`) компонентов не писать логику, только вызов методов.

```typescript
public ngOnInit(): void {
    this.loadData();
}

private loadData(): void {
    this.loading = true;
    this.api.getUsers().subscribe(users => this.processUsers(users));
}

private processUsers(users: User[]): void {
    this.items = users.filter(u => u.active);
    this.stats.total = this.items.length;
}
```

---

- Не используйте `any`.

```typescript
data: unknown; // если тип действительно неизвестен
data: Record<string, string>; // для объектов
data: MyInterface[]; // для массивов
```

---

- Всегда указывайте возвращаемый тип в методах.

```typescript
public getActiveUsers(): User[] {
    return this.users.filter(u => u.isActive);
}

public loadConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>('/api/config');
}

public resetForm(): void {
    this.form.reset();
}
```

---

- Запрещено мутировать входящие параметры.

Неправильно:

```typescript
class Component {
    @Input()
    public data: string = '';

    public updateData(): void {
        this.data = 'new value';
    }
}
```

Правильно:

```typescript
class Component {
    @Input()
    public data: string = '';

    @Output()
    public dataChange = new EventEmitter<string>();

    public updateData(): void {
        this.dataChange.emit('new value');
    }
}
```

---

- Добавляйте свойство `required: true` ко всем обязательным входным параметрам (@Input) компонента.

Неправильно:

```typescript
@Input()
public data = '';
```

Правильно:

```typescript
@Input({required: true})
public data = '';
```

---

- Используйте `ChangeDetectionStrategy.OnPush` по умолчанию.

`OnPush` уменьшает количество лишних проверок изменений и улучшает производительность приложения.

Используйте `Default` только если это действительно необходимо и причина выбора явно понятна.

Для ручного обновления используйте `ChangeDetectorRef.markForCheck()`.

```typescript
@Component({
    ...
    changeDetection: ChangeDetectionStrategy.OnPush,
})
```

---

- Если функция отвечает сразу за два и более действий, то её функционал нужно разделять.

Функция должны выполнять одну задачу. Если она имеет в названии "And", "With" - это нарушает Single Responsibility.

Неправильно:

```typescript
public handleUser(userId: string): void {
    const user = fetchUser(userId);
    user.name = user.name.trim().toLowerCase();
    user.age = user.age > 0 ? user.age : 0;
    this.saveUser(user);
    this.sendNotification(user.email);
}
```

Правильно:

```typescript
public handleUser(userId: string): void {
    const user = this.getUser(userId);
    this.saveUser(user);
    this.sendNotification(user.email);
}

public getUser(userId: string): User {
    const user = this.fetchUser(userId);
    return this.transformUser(user);
}

public fetchUser(userId: string): User {
    // Код для получения данных из базы
}

public transformUser(user: User): User {
    user.name = user.name.trim().toLowerCase();
    user.age = user.age > 0 ? user.age : 0;
    return user;
}
```

---

- Должны быть понятные названия переменных.
    - PascalCase для имен классов, интерфейсов, типов, camelCase для переменных, функций.
    - Имя переменной должно кратко описывать её предназначение. Общепринятые подходы:
        - значение — существительное: `cat`, `dog`;
        - массив — существительное во множественном числе: `cats`, `dogs`;
        - функция — глагол: `deletePage`, `update`;
        - класс — существительное с заглавной буквой: `Cat`, `Dog`;
        - константа — всё имя пишется заглавными буквами в стиле snake_case: `MAXIMUM_FOOD`, `LIMIT_X`;
        - обработчик — имя описывает событие, по которому он вызывается. Как правило, содержит префикс on или постфикс Handler: `onButtonClick`, `formSendHandler`.
    - В названиях переменных следует избегать использования таких слов как "data" и "info"
        - Названия должны быть очевидными для понимания. Использование общего термина делает смысл переменной менее ясным
          и требует дополнительного контекста для интерпретации.

        - Примеры подходящих названий переменных:
            - `userName` вместо `userData`;
            - `employeeList` вместо `employeeData`;
            - `productDetails` вместо `productInfo`.

---

- Не дублируйте код.

Принцип `DRY` – Don’t repeat yourself.

---

- Не оставляйте неиспользуемые переменные, функции или закомментированный код.

Если потребуется вернуться к старому коду, его всегда можно найти в истории версий.

---

- Используйте конструкцию /** ... */ для многострочных комментариев, а двойной слеш // для однострочных комментариев.

---

- Предпочитайте самодокументируемый код комментариям.

Избегайте комментариев, описывающих очевидные вещи.
Названия переменных должны сами говорить за себя, чтобы минимизировать необходимость в дополнительных комментариях.

---

- Функция не должна принимать больше 3 параметров.

Чем больше передаётся параметров в функцию, тем сложнее соблюсти их правильную последовательность, выполнить рефакторинг
функции и её вызовов. Когда есть необязательные параметры и нужно задать значение не первого из них - приходится передавать
значения для предыдущих. Использование типизированного объекта решает эту проблему.

Неправильно:

```typescript
public onAppInit(): void {
    this.processUser(1, "John", 35, undefined, true);
}

public processUser(id: number, name: string, age: number, hasCar?: boolean, hasBarcode?: boolean) {
    ...
}
```

Правильно:

```typescript
type UserInfo = {
    readonly id: number,
    readonly name: string,
    age: number,
    hasCar?: boolean,
    hasBarcode?: boolean,
}

public onAppInit(): void {
    this.processUser({
        id: 1,
        name: 'John',
        age: 35,
        hasBarcode: true,
    });
}

public processUser(user: UserInfo) {
    ...
}
```

---

- Не используйте негативные условия.

Неправильно:

```typescript
const isEmailNotVerified = (email) => {
    ...
}

if (!isEmailNotVerified(email)) {
    ...
}

if (isVerified === true) {
    ...
}
```

Правильно:

```typescript
const isEmailVerified = (email) => {
    ...
}

if (isEmailVerified(email)) {
    ...
}

if (isVerified) {
    ...
}
```

---

- Используйте `@HostListener` вместо `document.addEventListener` + `document.removeEventListener`.

Декоратор HostListener заменяет комбинацию `document.addEventListener` + `document.removeEventListener`.

Уменьшает количество кода, исключает утечки памяти - не нужно отписываться от события.

Неправильно:

```typescript
// Необходимо подписаться
public ngOnInit(): void {
    document.addEventListener('click', this.onCustomContentClick);
}

// И не забыть отписаться, иначе получим утечку памяти
public ngOnDestroy(): void {
    document.removeEventListener('click', this.onCustomContentClick);
}
```

Правильно:

```typescript
// HostListener делает всё сам
@HostListener('click', ['$event'])
public onCustomContentClick(event: MouseEvent): void {
    console.log(event.type);
}
```

---

- Используйте интерполяцию с помощью бэктиков (обратных кавычек) вместо конкатенации строк с помощью `+`.

---

- Не пишите `return` с условием `if` на одной строке.

Это может привести к снижению читаемости кода и усложнению его понимания.

Неправильно:

```typescript
public checkValue(value: number): string {
    if (value > 10) return 'Больше 10';
    return '10 или меньше';
}
```

Правильно:

```typescript
public checkValue(value: number): string {
    if (value > 10) {
        return 'Больше 10';
    } else {
        return '10 или меньше';
    }
}
```

---

- При импортировании нескольких значений из одного модуля следует использовать многострочный синтаксис.

Неправильно:

```typescript
import {longNameA, longNameB, longNameC, longNameD, longNameE} from 'path';
```

Правильно:

```typescript
import {
    longNameA,
    longNameB,
    longNameC,
    longNameD,
    longNameE,
} from 'path';
```

---

- Не добавляйте отступы до или после кода внутри блока.

Неправильно:

```typescript
function logFoo() {
    console.log(foo);

}

if (baz) {
    console.log(qux);
} else {
    console.log(foo);
}

```

Правильно:

```typescript
function logFoo() {
    console.log(foo);
}

if (baz) {
    console.log(qux);
} else {
    console.log(foo);
}
```

---

- Добавляйте висячие запятые.

Такой подход позволяет видеть разницу при просмотре изменений в git.

Правильно:

```typescript
const hero = {
    firstName: 'Florence',
    lastName: 'Nightingale',
};
```

---

## TESTING


- Названия тестов: `it('should [expected behavior] when [condition]')`.

---

- Используйте `fakeAsync`/`tick` для асинхронных тестов.

---

- Мокайте сервисы через `TestBed.overrideProvider`.

---

- Покрытие: минимум 80% для бизнес-логики.

---

- E2E: используйте `data-testid` атрибуты вместо привязки к классам.
