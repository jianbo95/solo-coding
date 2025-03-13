var ByteWrap = function(byte) {
    this.byte = byte;
    
    this.setBit = (n, value) => {
        if (value === 1) {
            // 设置第n位为1
            this.byte = this.byte | (1 << n);
        } else if (value === 0) {
            // 设置第n位为0
            this.byte = this.byte & ~(1 << n);
        } else {
            console.error('value 只能是1或0');
        }
    }

    // 从左到右顺序设置
    this.setBitByPos = (n, value) => {
        this.setBit(7 - n, value);
    };

    // 从左到右顺序设置
    this.getBitByPos = (n) => {
        return this.byte >> (7 - n) & 1;
    }

    this.byteValue = () => {
        return this.byte;
    }

    this.toString = () => {
        return this.byte.toString(2).padStart(8, '0');
    };

    this.toString2 = () => {
        return Array.from({ length: 8 }, (_, i) =>
            (this.byte >> (7 - i) & 1).toString()
        ).join('');
    };
};

export default ByteWrap;