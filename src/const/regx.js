const titleRegx = /^.{1,20}$/
const contentRegx = /^.{1,500}$/
const idRegx = /^.{1,10}$/
const pwRegx = /^.{1,10}$/
const tellRegx = /^(0[2-8]|\d{2,3})-\d{3,4}-\d{4}$/;
const nameRegx = /^.{1,10}$/

module.exports = { titleRegx, contentRegx,pwRegx,idRegx ,tellRegx,nameRegx}
// 중괄호를 열어서 여러개 할수가 있다.