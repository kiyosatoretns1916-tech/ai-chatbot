from openai import OpenAI
import os
import streamlit as st
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_ai_responses(messages):

    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages
    )
    return response.choices[0].message.content

st.title("AIチャット")

#セッションで履歴管理
if "chat_history" not in st.session_state:
    st.session_state.chat_history = [
        {"role": "system", "content": "あなたは優しいAIです"}
    ]

#履歴表示
for message in st.session_state.chat_history:
    if message["role"] == "system":
        continue

    with st.chat_message(message["role"]):
        st.write(message["content"])


user_input = st.chat_input("あなた：")


if user_input:
    #ユーザー追加
    st.session_state.chat_history.append({
        "role":"user",
        "content": user_input
    })
    #ユーザーメッセージ表示
    with st.chat_message("user"):
        st.write(user_input)

    #AI取得
    ai = get_ai_responses(st.session_state.chat_history)

    #AI返答追加
    st.session_state.chat_history.append({
        "role":"assistant",
        "content":ai
    })
    #AI返答を画面に表示
    with st.chat_message("assistant"):
        st.write(ai)

 # 履歴制限
if len(st.session_state.chat_history) > 10:
    system_message = st.session_state.chat_history[0]
    recent_messages = st.session_state.chat_history[-9:]
    st.session_state.chat_history = [system_message] + recent_messages

if st.button("会話リセット"):
    st.session_state.chat_history = [
        {"role": "system", "content": "あなたは優しいAIです"}
    ]
    st.rerun()