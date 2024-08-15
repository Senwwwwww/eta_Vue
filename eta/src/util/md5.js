import md5 from 'js-md5'
function strTomd5(str){
    // 将字符串进行md5加密
    return md5(str)
}
export{
    strTomd5
}