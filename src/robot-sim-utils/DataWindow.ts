export default class DataWindow<Data> {
  private readonly size: number;
  private readonly initial: Data[];
  private curArray: Data[];

  constructor(size: number, initial: Data[] = []) {
    this.size = size;
    this.initial = [...initial];
    this.curArray = [...initial];
  }

  addData(data: Data) {
    this.curArray.push(data);
    if (this.curArray.length >= this.size) this.curArray.shift();
  }

  values(): readonly Data[] {
    return this.curArray;
  }

  recent(index: number = 0): Data {
    return this.curArray[this.curArray.length - 1 - index];
  }

  get(index: number): Data {
    return this.curArray[index];
  }

  reset() {
    this.curArray = [...this.initial];
  }

  count(): number {
    return this.curArray.length;
  }
}
