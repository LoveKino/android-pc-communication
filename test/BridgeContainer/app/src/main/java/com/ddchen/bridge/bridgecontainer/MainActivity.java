package com.ddchen.bridge.bridgecontainer;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import com.ddchen.bridge.adbpc.AdbPc;
import com.ddchen.bridge.pcinterface.Caller;
import com.ddchen.bridge.pcinterface.HandleCallResult;
import com.ddchen.bridge.pcinterface.SandboxFunction;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        AdbPc adbPc = new AdbPc();
        String commandDir = "/data/user/0/com.ddchen.bridge.bridgecontainer/files/aosp_hook/output";
        String channel = "/data/user/0/com.ddchen.bridge.bridgecontainer/files/aosp_hook/command.json";

        Map sandbox = new HashMap();
        sandbox.put("subtraction", new SandboxFunction() {
            @Override
            public Object apply(Object[] args) {
                System.out.println("++++===========================");

                System.out.println(args);

                double a = Double.parseDouble(args[0].toString());
                double b = Double.parseDouble(args[1].toString());
                return a - b;
            }
        });

        Caller caller = adbPc.pc(channel, commandDir, sandbox);
        caller.call("add", new Object[]{1, 2}, new HandleCallResult() {
            @Override
            public void handle(Object json) {
                System.out.println("++++===========================");

                System.out.println(json);
            }

            @Override
            public void handleError(JSONObject errorInfo) {
            }
        });

        caller.call("error", new Object[]{}, new HandleCallResult() {
            @Override
            public void handle(Object json) {
                System.out.println("++++===========================");
                System.out.println(json);
            }

            @Override
            public void handleError(JSONObject errorInfo) {
                System.out.println("error:++++===========================");
                System.out.println(errorInfo);
            }
        });
    }
}
