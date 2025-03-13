/**
 * Mock模块
 */
export default {

    /**
     * mock的地址
     */
    mock: [
        // '/user/userInfo',
        // '/menu/ctrlTree',
    ],

    /**
     * 不需要mock的地址
     */
    unmock: [
    ],

    /**
     * 判断地址是否需要走 mock 地址
     * 先通过 unmock 进行判断，再通过 mock 进行判断
     * @param {string} url 
     */
    isMock(url) {
        for (let i = 0; i < this.unmock.length; i++) {
            let unMockUrl = this.unmock[i];
            if(url.indexOf(unMockUrl) != -1) {
                return false;
            }
        }
        for (let i = 0; i < this.mock.length; i++) {
            let mockUrl = this.mock[i];
            if(url.indexOf(mockUrl) != -1) {
                return true;
            }
        }
        return false;
    }
}