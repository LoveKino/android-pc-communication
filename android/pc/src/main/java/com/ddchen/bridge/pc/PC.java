package com.ddchen.bridge.pc;

import com.ddchen.bridge.pcinterface.Caller;
import com.ddchen.bridge.pcinterface.HandleCallResult;
import com.ddchen.bridge.pcinterface.Listener;
import com.ddchen.bridge.pcinterface.Listener.ListenHandler;
import com.ddchen.bridge.pcinterface.Sender;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.ddchen.bridge.pc.AssemblePCData.assembleRequestData;

/**
 * Created by yuer on 11/2/16.
 */

public class PC {
    private Map idMap = new HashMap();
    private Caller caller = null;

    public PC(Listener listener, final Sender sender, Map sandbox) {
        final MessageHandler handler = new MessageHandler(sandbox, sender, idMap);

        listener.listen(new ListenHandler() {
            @Override
            public void handle(JSONObject data) throws JSONException {
                handler.handle(data);
            }
        });

        this.caller = new Caller() {
            /**
             * {
             *         type: "request",
             *         data: {
             *             id: 1,
             *             source: {
             *                 type: "public",
             *                 name: "add",
             *                 args: [{
             *                     type: "jsonItem",
             *                     arg: 1
             *                 }, {
             *                     type: "jsonItem",
             *                     arg: 2
             *                 }]
             *             }
             * }
             */
            @Override
            public void call(String name, Object[] args, HandleCallResult handleCallResult) {
                // generate id
                String id = UUID.randomUUID().toString();
                // map id
                idMap.put(id, handleCallResult);

                try {
                    sender.send(assembleRequestData(name, args, id));
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        };
    }

    public Caller getCaller() {
        return this.caller;
    }
}
