package com.ddchen.bridge.bridgecontainer;

import android.content.Context;
import android.support.test.InstrumentationRegistry;
import android.support.test.runner.AndroidJUnit4;

import com.ddchen.bridge.adbpc.AdbPc;
import com.ddchen.bridge.pcinterface.Caller;
import com.ddchen.bridge.pcinterface.HandleCallResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.concurrent.CountDownLatch;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

/**
 * Instrumentation test, which will execute on an Android device.
 *
 * @see <a href="http://d.android.com/tools/testing">Testing documentation</a>
 */
@RunWith(AndroidJUnit4.class)
public class ExampleInstrumentedTest {
    private Caller caller = null;
    {
        // Context of the app under test.
        AdbPc adbPc = new AdbPc();
        String commandDir = "/data/user/0/com.ddchen.bridge.bridgecontainer/files/aosp_hook/output";
        String channel = "/data/user/0/com.ddchen.bridge.bridgecontainer/files/aosp_hook/command.json";
        this.caller = adbPc.pc(channel, commandDir, null);
    }
    @Test
    public void useAppContext() throws Exception {
        // Context of the app under test.
        Context appContext = InstrumentationRegistry.getTargetContext();
        assertEquals("com.ddchen.bridge.bridgecontainer", appContext.getPackageName());
    }

    @Test
    public void callPCAdd() throws Exception {
        final CountDownLatch signal = new CountDownLatch(1);
        final Exception[] errors = {null};

        caller.call("add", new Object[]{1, 2}, new HandleCallResult() {
            @Override
            public void handle(Object json) {
                try {
                    if ((int) json != 3) {
                        throw new Exception(json + "!=" + 3);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    errors[0] = e;
                } finally {
                    signal.countDown();
                }
            }

            @Override
            public void handleError(JSONObject errorInfo) {
                try {
                    errors[0] = new Exception(errorInfo.getString("msg"));
                } catch (JSONException e) {
                    e.printStackTrace();
                    errors[0] = e;
                }
                signal.countDown();
            }
        });

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(10000);
                    errors[0] = new Exception("timeout");
                    signal.countDown();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        signal.await();
        assertNull(errors[0]);
    }

    @Test
    public void callPCTest() throws Exception {
        final CountDownLatch signal = new CountDownLatch(1);
        final Exception[] errors = {null};

        JSONObject paramA = new JSONObject();
        paramA.put("a1", 10);
        paramA.put("a2", 10);

        JSONArray paramB = new JSONArray();
        paramB.put("ppp");
        caller.call("test", new Object[]{paramA, paramB}, new HandleCallResult() {
            @Override
            public void handle(Object json) {
                System.out.println(json);
                try {
                    JSONObject jobj = (JSONObject) json;
                    String prop = (String) jobj.getJSONArray("new").get(0);
                    System.out.println(prop);
                    if (!prop.equals("ppp")) {
                        throw new Exception(jobj + " new[0] != " + "ppp");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    errors[0] = e;
                } finally {
                    signal.countDown();
                }
            }

            @Override
            public void handleError(JSONObject errorInfo) {
                System.out.println(errorInfo);
                try {
                    errors[0] = new Exception(errorInfo.getString("msg"));
                } catch (JSONException e) {
                    e.printStackTrace();
                    errors[0] = e;
                }
                signal.countDown();
            }
        });

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(10000);
                    errors[0] = new Exception("timeout");
                    signal.countDown();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        signal.await();
        assertNull(errors[0]);
    }

    @Test
    public void callError() throws Exception {
        final CountDownLatch signal = new CountDownLatch(1);
        final Exception[] errors = {null};

        caller.call("error", new Object[]{}, new HandleCallResult() {
            @Override
            public void handle(Object json) {
                errors[0] = new Exception("unexpected");
                signal.countDown();
            }

            @Override
            public void handleError(JSONObject errorInfo) {
                try {
                    if (!errorInfo.getString("msg").equals("error test")) {
                        throw new Exception("error msg is not error test");
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    errors[0] = e;
                } finally {
                    signal.countDown();
                }
            }
        });

        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    Thread.sleep(10000);
                    errors[0] = new Exception("timeout");
                    signal.countDown();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        });

        signal.await();
        assertNull(errors[0]);
    }
}


