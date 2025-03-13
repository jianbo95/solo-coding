export default function(obj, field) {
    if(obj == null) {
        return null;
    } else {
        return obj[field];
    }
}