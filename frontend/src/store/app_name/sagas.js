import { takeEvery, put, call, fork, select, throttle } from 'redux-saga/effects'
import { push } from 'react-router-redux'
import {delay} from 'redux-saga';
import api from 'services/api'
import * as actions from './actions'


export function* watchTokenToUser(action){
    const {token} = action
    const response = yield call (fetch, '/api/user/', {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            'Authorization': 'Token ' + token
        },
    })
    if(response.ok){
        const result = yield call(() => response.json())
        yield put(actions.set_userinfo(result.id, result.profile, result.chat_list, token))
    }
    else{
        yield put(actions.login_fail())
    }
}

export function* watchLoginFail() {
    yield put(actions.send_alert('로그인을 먼저 해주십시오.'))
    localStorage.setItem("user_info", JSON.stringify({"id":0, "profile":{"username": "","nickname": ""}, "chat_list":[], "token":""}))
}

export function* watchValidateToken(action){
    const {token} = action
    const response = yield call (fetch, '/api/user/', {
        method: "GET",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            'Authorization': 'Token ' + token
        },
    })
    if(response.ok){
        const result = yield call(() => response.json())
        yield put(actions.set_userinfo(result.id, result.profile, result.chat_list, token))
        yield put(actions.send_alert('정상적으로 로그인 되었습니다.'))
    }
    else{
        yield put(actions.login_fail())
    }
}

export function* watchLogout(action) {
    yield put(actions.set_userinfo(0, {username: "",nickname: ""}, [], ""))
    yield put(actions.send_alert('정상적으로 로그아웃 되었습니다.'))
}

export function* watchLogin(action) {
    const {username, password} = action
    const response = yield call (fetch, '/api/obtain-auth-token/', {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({username, password})
    })
    if(response.ok) {
        const result = yield call(() => response.json())
        yield put(actions.validate_token(result.token))
    }
    else{
        yield put(actions.send_alert('올바른 아이디 혹은 비밀번호를 입력해주세요.'))
    }
}

export function* watchSendAlert(action) {
    yield put(actions.add_alert(action.message))
    yield call(delay, 5000)
    yield put(actions.del_alert())
}

export function* watchUSERINFO(action) {
    localStorage.setItem("user_info", JSON.stringify({"id":action.id, "profile":action.profile, "chat_list":action.chat_list, "token":action.token}))
}

export function* watchSignUp(action){
    const response = yield call (fetch, `/api/user/`, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            'username': action.username,
            'password': action.password,
            'nickname': action.nickname,
        })
    });
    if(response.ok){
        yield put(actions.send_alert('정상적으로 회원가입이 완료되었습니다.'))
        yield put(push('/'))
    }
    else if(response.status == 400){
        yield put(actions.send_alert('이미 존재하는 아이디거나, 인증코드가 올바르지 않습니다.'))
    }
}


export default function* () {
    yield takeEvery(actions.USER_LOGIN, watchLogin)
    yield takeEvery(actions.VALIDATE_TOKEN, watchValidateToken)
    yield takeEvery(actions.SET_USERINFO, watchUSERINFO)
    yield takeEvery(actions.USER_LOGOUT, watchLogout)
    yield takeEvery(actions.LOGIN_FAIL, watchLoginFail)
    yield takeEvery(actions.TOKEN_TO_USER, watchTokenToUser)
    yield takeEvery(actions.SIGN_UP, watchSignUp)
    yield takeEvery(actions.SEND_ALERT, watchSendAlert)
}