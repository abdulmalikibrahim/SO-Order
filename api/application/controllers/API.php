<?php
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
require_once FCPATH . 'vendor/autoload.php';
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use Picqer\Barcode\BarcodeGeneratorHTML;
use Dompdf\Dompdf;

class API extends MY_Controller {

    function uploadData()
    {
        // Konfigurasi upload file
        $config['upload_path']   = './uploads/';
        $config['allowed_types'] = 'xls|xlsx';

        $this->upload->initialize($config);
        if (!$this->upload->do_upload('upload-file')) {
            // Jika upload gagal, tampilkan error
            $error = $this->upload->display_errors();
            $this->fb(["statusCode" => 500, "res" => $error]);
        }
        
        // Jika upload berhasil
        $file_data = $this->upload->data();
        $file_path = $file_data['full_path'];
        // Load PHPExcel
        require 'vendor/autoload.php';
        $objPHPExcel = IOFactory::load($file_path);

        $clear_data = $this->model->delete("master", "id !=");
        // Membaca sheet pertama
        $sheet = $objPHPExcel->getSheet(0);
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();

        $data = [];
        // Looping untuk membaca data dari setiap baris
        for ($row = 2; $row <= $highestRow; $row++) { // Mulai dari baris ke-2 (baris pertama biasanya header)
            if(!empty(str_replace(" ","",$sheet->getCell('A' . $row)->getValue()))){
                $rack_address = $sheet->getCell('AR' . $row)->getCalculatedValue();
                if($rack_address == "#N/A"){
                    $rack_address = "";
                }
    
                $part_type = $sheet->getCell('AT' . $row)->getCalculatedValue();
                if($part_type == "#N/A"){
                    $part_type = "";
                }
    
                $wh_zone = $sheet->getCell('AU' . $row)->getCalculatedValue();
                if($wh_zone == "#N/A"){
                    $wh_zone = "";
                }
    
                $data[] = [
                    'plant_code' => $sheet->getCell('A' . $row)->getValue(),
                    'shop_code' => $sheet->getCell('B' . $row)->getValue(),
                    'part_category' => $sheet->getCell('C' . $row)->getValue(),
                    'route' => $sheet->getCell('D' . $row)->getValue(),
                    'lp' => $sheet->getCell('E' . $row)->getValue(),
                    'trip' => $sheet->getCell('F' . $row)->getValue(),
                    'vendor_code' => $sheet->getCell('G' . $row)->getValue(),
                    'vendor_alias' => $sheet->getCell('H' . $row)->getValue(),
                    'vendor_site' => $sheet->getCell('I' . $row)->getValue(),
                    'vendor_site_alias' => $sheet->getCell('J' . $row)->getValue(),
                    'order_no' => $sheet->getCell('K' . $row)->getValue(),
                    'po_number' => $sheet->getCell('L' . $row)->getValue(),
                    'calc_date' => Date::excelToDateTimeObject($sheet->getCell('M' . $row)->getValue())->format("Y-m-d"),
                    'order_date' => Date::excelToDateTimeObject($sheet->getCell('N' . $row)->getValue())->format("Y-m-d"),
                    'order_time' => Date::excelToDateTimeObject($sheet->getCell('O' . $row)->getValue())->format("H:i:s"),
                    'del_date' => Date::excelToDateTimeObject($sheet->getCell('R' . $row)->getValue())->format("Y-m-d"),
                    'del_time' => Date::excelToDateTimeObject($sheet->getCell('S' . $row)->getValue())->format("H:i:s"),
                    'del_cycle' => $sheet->getCell('T' . $row)->getValue(),
                    'doc_no' => str_replace(" ","",$sheet->getCell('U' . $row)->getValue()),
                    'part_no' => $sheet->getCell('AB' . $row)->getValue(),
                    'part_name' => $sheet->getCell('AC' . $row)->getValue(),
                    'job_no' => $sheet->getCell('AD' . $row)->getValue(),
                    'lane' => $sheet->getCell('AE' . $row)->getValue(),
                    'qty_kanban' => $sheet->getCell('AF' . $row)->getValue(),
                    'order_kbn' => $sheet->getCell('AG' . $row)->getValue(),
                    'order_pcs' => $sheet->getCell('AH' . $row)->getValue(),
                    'rack_address' => $rack_address,
                    'packaging_type' => $sheet->getCell('AS' . $row)->getCalculatedValue(),
                    'part_type' => $part_type,
                    'wh_zone' => $wh_zone,
                    'vendor_name' => $sheet->getCell('AV' . $row)->getCalculatedValue(),
                ];
            }
        }
        
        $insert = $this->model->insert_batch("master",$data);
        if($insert){
            $fb = ["statusCode" => 200, "res" => "Upload success"];
        }else{
            $fb = ["statusCode" => 500, "res" => "Upload failed"];
        }
        unlink($file_path);
        $this->fb($fb);
    }

    function getDataMaster()
    {
        //GET DATA
        $data = $this->model->gd("master","vendor_code,vendor_alias,download_kanban,download_dn","id != '' GROUP BY vendor_code ORDER BY vendor_code,download_kanban,download_dn ASC","result");
        if(empty($data)){
            $fb = ["statusCode" => 404, "res" => "Data kosong"];
            $this->fb($fb);
        }

        $fb = ["statusCode" => 200, "res" => $data];
        $this->fb($fb);
    }
}
