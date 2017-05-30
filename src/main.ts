export class SimpleClass {
  Add(a: number, b: number): number {
    return a + b
  }
}

const simpleClass: SimpleClass = new SimpleClass()
console.log(simpleClass.Add(2, 3))
