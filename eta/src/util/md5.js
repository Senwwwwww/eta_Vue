import md5 from 'js-md5'
function strTomd5(str){
    // 将字符串进行md5加密
    // 实现加密加严
    return md5(md5(md5(str+'eta')+'hss')+'zc')
}
export{
    strTomd5
}