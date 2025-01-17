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
                $data[$sheet->getCell('A' . $row)->getValue()] = [
                    'part_no' => $sheet->getCell('A' . $row)->getValue(),
                    'part_name' => $sheet->getCell('B' . $row)->getValue(),
                    'qty_kanban' => $sheet->getCell('C' . $row)->getValue(),
                    'satuan_sap' => $sheet->getCell('D' . $row)->getValue(),
                    'vendor_code' => $sheet->getCell('E' . $row)->getValue(),
                    'supplier' => $sheet->getCell('F' . $row)->getValue(),
                    'category' => $sheet->getCell('G' . $row)->getValue(),
                    'tipe' => $sheet->getCell('H' . $row)->getValue(),
                    'jam_delivery' => $sheet->getCell('I' . $row)->getValue(),
                    'cycle' => $sheet->getCell('J' . $row)->getValue(),
                    'cycle_issue' => $sheet->getCell('K' . $row)->getValue(),
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
        $data = $this->model->gd("master","*","id != ''","result");
        if(empty($data)){
            $fb = ["statusCode" => 200, "res" => []];
            $this->fb($fb);
        }

        $newData = [];
        if(!empty($data)){
            $no = 1;
            foreach ($data as $data) {
                $newData[] = [
                    $no++,
                    $data->part_no,
                    $data->part_name,
                    $data->qty_kanban,
                    $data->satuan_sap,
                    $data->vendor_code,
                    $data->supplier,
                    $data->category,
                    $data->tipe,
                    $data->jam_delivery,
                    $data->cycle,
                    $data->cycle_issue,
                ];
            }
        }

        $fb = ["statusCode" => 200, "res" => $newData];
        $this->fb($fb);
    }

    function getWorkingDay()
    {
        $start = date("Y-m-01",strtotime("-6 month"));
        $end = date("Y-m-t",strtotime("+6 month"));
        $shift = $this->input->get("shift");
        $data = $this->model->gd("working_calendar","*","tanggal BETWEEN '$start' AND '$end' AND status = '$shift'","result");

        $newData = [];
        if(!empty($data)){
            foreach ($data as $data) {
                $newData[] = $data->tanggal;
            }
        }

        $fb = ["statusCode" => 200, "res" => $newData];
        $this->fb($fb);
    }

    function getDataReference() 
    {
        $this->form_validation->set_rules('table', 'Table', 'trim|required');
        
        if ($this->form_validation->run() === FALSE) {
            $fb = ["statusCode" => 400, "res" => validation_errors()];
            $this->fb($fb);
        }
        
        $table = $this->input->post("table",TRUE);
        //GET DATA
        if($table == "actual_gi" || $table == "po_qty" || $table == "order_by_shop"){
            $columnSelect = $table == "order_by_shop" ? "pdd" : "tanggal";
            $month = !empty($this->input->post("month",TRUE)) ? $this->input->post("month",TRUE) : date("m");
            $year = !empty($this->input->post("year",TRUE)) ? $this->input->post("year",TRUE) : date("Y");
            $shop = !empty($this->input->post("shop",TRUE)) ? $this->input->post("shop",TRUE) : "ALL";
            $filterShop = $table == "order_by_shop" ? ($shop == "ALL" ? ' AND shop != ""' : ' AND shop = "'.$shop.'"') : '' ;
            
            $period = $year."-".sprintf("%02d",$month)."-";
            $data = $this->model->join_data($table.' as a', "master as m", "a.part_number = m.part_no", "a.*,m.part_name,m.supplier,m.tipe", "a.part_number != '' AND a.".$columnSelect." LIKE '%$period%' $filterShop", "result");
        }else{
            $data = $this->model->join_data($table.' as a', "master as m", "a.part_number = m.part_no", "a.*,m.part_name,m.supplier,m.tipe", "a.part_number !=", "result");
        }
        if(empty($data)){
            $fb = ["statusCode" => 200, "res" => []];
            $this->fb($fb);
        }

        $newData = [];
        if(!empty($data)){
            $no = 1;
            if($table == "actual_gi"){
                foreach ($data as $data) {
                    $newData[] = [
                        $no++,
                        date("d M Y",strtotime($data->tanggal)),
                        $data->part_number,
                        $data->part_name,
                        $data->supplier,
                        $data->tipe,
                        $data->qty,
                    ];
                }
            }else if($table == "po_qty"){
                foreach ($data as $data) {
                    $newData[] = [
                        $no++,
                        date("M Y",strtotime($data->tanggal)),
                        $data->po_number,
                        $data->part_number,
                        $data->part_name,
                        $data->supplier,
                        $data->tipe,
                        $data->qty,
                    ];
                }
            }else if($table == "order_by_shop"){
                foreach ($data as $data) {
                    $newData[] = [
                        $no++,
                        date("d M Y",strtotime($data->created)),
                        date("d M Y",strtotime($data->pdd)),
                        $data->shop,
                        $data->part_number,
                        $data->part_name,
                        $data->supplier,
                        $data->tipe,
                        $data->qty,
                    ];
                }
            }else{
                foreach ($data as $data) {
                    $newData[] = [
                        $no++,
                        $data->part_number,
                        $data->part_name,
                        $data->supplier,
                        $data->tipe,
                        ($table == "ratio") ? $data->ratio : $data->qty,
                    ];
                }
            }
        }

        $fb = ["statusCode" => 200, "res" => $newData];
        $this->fb($fb);   
    }

    function uploadDataReference()
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

        $table = $this->input->post("table",TRUE);
        // Membaca sheet pertama
        $sheet = $objPHPExcel->getSheet(0);
        $highestRow = $sheet->getHighestRow();
        $highestColumn = $sheet->getHighestColumn();

        $data = [];
        if($table == "safety_stock" || $table == "average_usage"){
            $clear_data = $this->model->delete($table, "part_number !=");
            // Looping untuk membaca data dari setiap baris
            for ($row = 2; $row <= $highestRow; $row++) { // Mulai dari baris ke-2 (baris pertama biasanya header)
                if(!empty(str_replace(" ","",$sheet->getCell('A' . $row)->getValue()))){
                    $data[$sheet->getCell('A' . $row)->getValue()] = [
                        'part_number' => $sheet->getCell('A' . $row)->getValue(),
                        'qty' => $sheet->getCell('B' . $row)->getValue(),
                    ];
                }
            }
        }else if($table == "actual_gi"){
            //Clear Data aneh seperti tanggal 0000-00-00
            $this->model->delete($table, "tanggal = '0000-00-00'");
            // Looping untuk membaca data dari setiap baris
            for ($row = 2; $row <= $highestRow; $row++) { // Mulai dari baris ke-2 (baris pertama biasanya header)
                if(!empty(str_replace(" ","",$sheet->getCell('A' . $row)->getValue()))){
                    // Mendapatkan nilai tanggal dari cell
                    $tanggalExcel = $sheet->getCell('A' . $row)->getValue();
                    // Konversi ke format DateTime
                    if (Date::isDateTime($sheet->getCell('A' . $row))) {
                        $tanggal = Date::excelToDateTimeObject($tanggalExcel)->format('Y-m-d'); // Format YYYY-MM-DD
                    } else {
                        $tanggal = $tanggalExcel; // Jika bukan tanggal, gunakan langsung
                    }
                    $partNumber = $sheet->getCell('B' . $row)->getValue();
                    $qty = $sheet->getCell('C' . $row)->getValue();

                    $data[$partNumber] = [
                        'tanggal' => $tanggal,
                        'part_number' => $partNumber,
                        'qty' => $qty,
                    ];

                    //Clear Data
                    $this->model->delete($table, "tanggal = '$tanggal' AND part_number = '$partNumber'");
                }
            }
        }else if($table == "order_by_shop"){
            //Clear Data aneh seperti pdd 0000-00-00
            $this->model->delete($table, "pdd = '0000-00-00' OR pdd = '1970-01-01'");
            // Looping untuk membaca data dari setiap baris
            for ($row = 2; $row <= $highestRow; $row++) { // Mulai dari baris ke-2 (baris pertama biasanya header)
                if(!empty(str_replace(" ","",$sheet->getCell('A' . $row)->getValue()))){
                    $partNumber = $sheet->getCell('A' . $row)->getValue();
                    $qty = $sheet->getCell('B' . $row)->getValue();
                    $pddExcel = $sheet->getCell('C' . $row)->getValue();
                    $pdd = Date::isDateTime($sheet->getCell('C' . $row)) ? Date::excelToDateTimeObject($pddExcel)->format('Y-m-d') : $pddExcel;
                    $shop = $sheet->getCell('D' . $row)->getValue();

                    $data[] = [
                        'part_number' => $partNumber,
                        'qty' => $qty,
                        'pdd' => $pdd,
                        'shop' => $shop
                    ];

                    //Clear Data
                    $this->model->delete($table, "pdd = '$pdd' AND part_number = '$partNumber'");
                }
            }
        }else if($table == "po_qty"){
            //Clear Data aneh seperti tanggal 0000-00-00
            $this->model->delete($table, "tanggal = '0000-00-00' OR tanggal  = '1970-01-01'");
            // Looping untuk membaca data dari setiap baris
            for ($row = 2; $row <= $highestRow; $row++) { // Mulai dari baris ke-2 (baris pertama biasanya header)
                if(!empty(str_replace(" ","",$sheet->getCell('A' . $row)->getValue()))){
                    $partNumber = $sheet->getCell('A' . $row)->getValue();
                    $poNumber = $sheet->getCell('B' . $row)->getValue();
                    $qty = $sheet->getCell('C' . $row)->getValue();
                    $tanggalExcel = $sheet->getCell('D' . $row)->getValue();
                    $tanggal = Date::isDateTime($sheet->getCell('D' . $row)) ? Date::excelToDateTimeObject($tanggalExcel)->format('Y-m-d') : $tanggalExcel;

                    $data[] = [
                        'part_number' => $partNumber,
                        'po_number' => $poNumber,
                        'qty' => $qty,
                        'tanggal' => $tanggal,
                    ];

                    //Clear Data
                    $this->model->delete($table, "tanggal = '$tanggal' AND part_number = '$partNumber'");
                }
            }
        }else if($table == "ratio"){
            $clear_data = $this->model->delete($table, "part_number !=");
            // Looping untuk membaca data dari setiap baris
            for ($row = 2; $row <= $highestRow; $row++) { // Mulai dari baris ke-2 (baris pertama biasanya header)
                if(!empty(str_replace(" ","",$sheet->getCell('A' . $row)->getValue()))){
                    $partNumber = $sheet->getCell('A' . $row)->getValue();
                    $vendorCodeDb = $this->model->gd("master","vendor_code","part_no = '$partNumber'","row");
                    $vendorCode = !empty($vendorCodeDb->vendor_code) ? $vendorCodeDb->vendor_code : '';
                    $ratio = $sheet->getCell('B' . $row)->getValue();
                    $data[$sheet->getCell('A' . $row)->getValue()] = [
                        'part_number' => $partNumber,
                        'vendor_code' => $vendorCode,
                        'ratio' => $ratio,
                    ];
                }
            }
        }
        
        $insert = $this->model->insert_batch($table,$data);
        if($insert){
            $fb = ["statusCode" => 200, "res" => "Upload success"];
        }else{
            $fb = ["statusCode" => 500, "res" => "Upload failed"];
        }
        unlink($file_path);
        $this->fb($fb);
    }

    function saveCalendar()
    {
        $this->form_validation
            ->set_rules('tanggal', 'Tanggal', 'trim|required')
            ->set_rules('tipe', 'Tipe', 'trim|required');

        if($this->form_validation->run() === FALSE){
            $fb = ["statusCode" => 400, "res" => validation_errors()];
            $this->fb($fb);
        }
        $tanggal = explode(",",$this->input->post("tanggal"));
        $tipe = $this->input->post("tipe");
        
        foreach ($tanggal as $key => $value) {
            switch ($tipe) {
                case '1 Shift':
                    $shift = "1";
                    break;
                case '2 Shift':
                    $shift = "2";
                    break;
                case 'OFF Production':
                    $shift = "0";
                    break;
                default:
                    $shift = "0";
                    break;
            }

            $status = $this->model->gd("working_calendar","id","tanggal = '$value'","row");
            $dataUpdate = [
                "tanggal" => $value,
                "status" => $shift,
            ];
            if(!empty($status)){
                $this->model->update("working_calendar","tanggal = '$value'",$dataUpdate);
            }else{
                $this->model->insert("working_calendar",$dataUpdate);
            }
        }

        $fb = ["statusCode" => 200, "res" => "Data berhasil di update. Reload halaman dimulai"];
        $this->fb($fb);
    }

    function setupNormal()
    {
        $this->form_validation
            ->set_rules('month', 'Month', 'integer|trim|required|max_length[2]')
            ->set_rules('year', 'Year', 'integer|trim|required|max_length[5]');
        
        if($this->form_validation->run() === FALSE){
            $fb = ["statusCode" => 500, "res" => validation_errors()];
            $this->fb($fb);
        }

        $month = sprintf("%02d",($this->input->post("month") + 1));
        $year = $this->input->post("year");
        
        $end_date = date("t",strtotime(`$year-$month-01`));
        for ($i=1; $i <= $end_date; $i++) {
            //CHECK DAY
            $date = sprintf("%02d",$i);
            $dateFull = $year."-".$month."-".$date;
            $day = date("D",strtotime($dateFull));
            if(substr_count($day,"Sat") > 0 || substr_count($day,"Sun") > 0){
                $dataSubmit = [
                    "tanggal" => $dateFull,
                    "status" => "0"
                ];
            }else{
                $dataSubmit = [
                    "tanggal" => $dateFull,
                    "status" => "2"
                ];
            }
            //CHECK TANGGAL
            $checking = $this->model->gd("working_calendar","id","tanggal = '$dateFull'","row");
            if(!empty($checking)){
                $this->model->update("working_calendar","id = '".$checking->id."'",$dataSubmit);
            }else{
                $this->model->insert("working_calendar",$dataSubmit);
            }
        }
        
        $fb = ["statusCode" => 200, "res" => "Setup normal berhasil. Reload halaman dimulai"];
        $this->fb($fb);
    }
}
