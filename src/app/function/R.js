export default function(_succ, p1, p2, p3, p4, p5, p6, p7, p8, p9) {
    if(_succ != null) { 
        if(Util.isFunction(_succ) == false) {
            console.error('is not a function ' + _succ);
            return;
        }
        try {
            _succ(p1, p2, p3, p4, p5, p6, p7, p8, p9); 
        } catch (e) {
            console.error(e);
        }
    }
}