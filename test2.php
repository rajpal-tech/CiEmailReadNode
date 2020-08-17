<?php 

require_once 'service/Google_Model.php';
require_once 'service/Google_Service.php';
require_once 'service/Google_ServiceResource.php';
require_once 'auth/Google_AssertionCredentials.php';
require_once 'auth/Google_Signer.php';
require_once 'auth/Google_P12Signer.php';
require_once 'service/Google_BatchRequest.php';
require_once 'external/URITemplateParser.php';
require_once 'auth/Google_Auth.php';
require_once 'cache/Google_Cache.php';
require_once 'io/Google_IO.php';
require_once('service/Google_MediaFileUpload.php');
 
$client_id     = '175160586549-4vlcm5piovihb4jt3sd35cqi4tfxxxxx.apps.googleusercontent.com';
$account_name  = '175160586549-4vlcm5piovihb4jt3sd35cqi4txxxxx@developer.gserviceaccount.com';
$key_file_name = 'MaTuRi-2b0228176bc8.p12';
 
$receipt = '{"orderId":"12999763169054705758.1343513511797676","packageName":"jp.maturi.android.hsb","productId":"m_member_highspeedboyz_2.99","purchaseTime":1410833767578,"purchaseState":0,"developerPayload":"CAQEAhaYH9MrPxYOPrLJAyFCdpYC76V6MPgu0v9","purchaseToken":"hnmmfkliefklbeeenooidabh.AO-J1OwRIVqhDtAElccXHbeEARLgpdaDgGFRfixj97lQyb-mOhnZydhgohqhnPgd0k8BD0InF7weqGcKhRWF6cfGEAQDxEZGv_JiDk3bCIS1hDOMUf8hCHQOOwowEYOBm6BmERQKazeV3xUNWU-cnVk0CZAdvtTlYA"}';
$receipt = json_decode($receipt, true);
 
try {
    $client = new Google_Client();
    $client->setApplicationName($receipt['packageName']);
    $client->setClientId($client_id);
 
    $key_file = APPPATH . 'config/' . ENVIRONMENT . '/android_purchase_file/' . $key_file_name;
    $key      = file_get_contents($key_file);
 
    $auth = new Google_AssertionCredentials(
        $account_name,
        array('https://www.googleapis.com/auth/androidpublisher'),
        $key
    );
 
    $client->setAssertionCredentials($auth);
    $AndroidPublisherService = new Google_AndroidPublisherService($client);
    $res = $AndroidPublisherService->purchases->get(
        $receipt['packageName'],
        $receipt['productId'],
        $receipt['purchaseToken']
    );
 
    $status = 0;
    if (isset($res['validUntilTimestampMsec'])) {
        $current_time = time();
        $valid_time = $res['validUntilTimestampMsec'] / 1000;
        if ($current_time < $valid_time) {
            $status = 1;
        }
    } else {
        throw new Exception('Invalid response data');
    }
 
 
         // other operations of course there is also need to verify whether the same package name
} catch (Exception $e) {
         // abnormalities
}

?>