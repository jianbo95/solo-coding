import ByteWrap from './ByteWrap.js';

var BinWrap = function() {
    this.data = [ 0b00000000 ]; // 字节数组
    this.byteIndex = (pos) => {
        return Math.floor(pos / 8);
    };
    
    this.setInt2 = (pos, value) => {
        this.setInt(pos, value, 16);
    };

    this.setInt = (pos, value, binSize) => {
        // pos 第几位
        var binValue = value.toString(2);
        if(binValue.length > binSize) {
            throw new Error('值过大' + value);
        }
        binValue = binValue.padStart(binSize, '0');
        // console.log('setInt', value, binValue);
        // console.log('binValue', binValue);
        this.setBin(pos, binValue);
    };

    this.setBin = (pos, binValue) => {
        for (let index = 0; index < binValue.length; index++) {
            const bit = binValue[index];
            var tpos = pos + index;
            // console.log('setBit ' + tpos + ' ' + bit);
            this.setBit(tpos, Number(bit));
        }
    };

    this.getInt2 = (pos) => {
        var binValue = this.getBin(pos, 16);
        return this.binaryToInt(binValue);
    };

    this.getInt = (pos, binSize) => {
        var binValue = this.getBin(pos, binSize);
        return this.binaryToInt(binValue);
    };

    this.getBin = (pos, length) => {
        var binValue = "";
        for (let i = 0; i < length; i++) {
            var bit = this.getBit(pos + i);
            binValue += bit;
        }
        return binValue;
    };

    this.toBin = () => {
        var binValue = "";
        var length = this.data.length * 8;
        for (let i = 0; i < length; i++) {
            var bit = this.getBit(i);
            binValue += bit;
        }
        return binValue;
    };

    this.toHex = () => {
        var bytes = this.data;
        var str = '';
        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            var h = byte.toString(16);
            str += h;
        }
        return str;
    };

    this.toUint8Array = () => {
        return new Uint8Array(this.data);
    };

    this.fromUint8Array = (arr) => {
        this.data = Array.from(arr);
    };
    
    this.binaryToInt = (binaryString) => {
        let decimalNumber = parseInt(binaryString, 2);
        return decimalNumber;
    };

    this.getBit = (pos) => {
        var byteIndex = this.byteIndex(pos);
        var byte = this.data[byteIndex];
        var byteWrap = new ByteWrap(byte);
        var binPos = pos % 8;
        return byteWrap.getBitByPos(binPos);
    };

    this.getByteArray = (pos, size) => {
        var bytes = [];
        for (let i = 0; i < size; i++) {
            var bitString = '';
            for (let j = 0; j < 8; j++) {
                var tpos = pos + i * 8 + j;
                var bit = this.getBit(tpos);
                bitString += bit;
            }
            var byte = parseInt(bitString, 2);
            bytes.push(byte);
        }
        return bytes;
    };

    this.setBit = (pos, value) => {
        var byteIndex = this.byteIndex(pos);
        if(this.data[byteIndex] == null) {
            this.data[byteIndex] = 0b00000000;
        }
        var byte = this.data[byteIndex];
        var byteWrap = new ByteWrap(byte);
        var binPos = pos % 8;
        if(value == 1) {
            byteWrap.setBitByPos(binPos, 1);
        } else if(value == 0) {
            byteWrap.setBitByPos(binPos, 0);
        } else {
            console.error('value 只能是1或0，当前值' + value);
        }
        var newValue = byteWrap.byteValue();
        this.data[byteIndex] = newValue;
    }
};

export default BinWrap;