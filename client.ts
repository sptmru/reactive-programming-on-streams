import { Writable, Readable } from 'node:stream';

const dbArr: object[] = [];

interface Objects {
  [key: string]: number;
}

interface APIResponse {
  start: number,
  end: number,
  objects: Objects,
}

class ApiReadable extends Readable {

    private uri: string;
    private offset: number;
    private limit: number

    constructor() {
        super({ objectMode: true });
        this.uri = 'http://localhost:3000/';
        this.offset = 0;
        this.limit = 100;
    }

    async getAPI(): Promise<APIResponse|null> {
        const response = await fetch(`${this.uri}?limit=${this.limit}&offset=${this.offset}`);
        const result = await response.json();

        if (result?.end && (result.end - result.start) < this.limit ) {
            return null;
        }

        console.log(result);

        return result;
    }

    override async _read() {
      const result = await this.getAPI();
      if (!result) {
          this.push(null);
          return;
      } else {
          this.push(result.objects);
      }
      this.offset = result.end > this.offset ? result.end + 1 : result.end;
    }
}

class ObjWritable extends Writable {

    private dbArr: object[];

    constructor(dbArr: object[]) {
        super({ highWaterMark: 5, objectMode: true });
        this.dbArr = dbArr;
    }

    writeToObj(chunk: object) {
      this.dbArr.push(chunk);
    }

    override _write(chunk: object, _encoding: string, callback: Function) {
        this.writeToObj(chunk);
        callback();
    }

    override _writev(chunks: object[], callback: Function) {
        this.dbArr.push(...chunks);
        callback();
    }
 
}

const objWritable = new ObjWritable(dbArr);
const apiReadable = new ApiReadable();

apiReadable.pipe(objWritable);
apiReadable.on('end', () => console.log(dbArr));