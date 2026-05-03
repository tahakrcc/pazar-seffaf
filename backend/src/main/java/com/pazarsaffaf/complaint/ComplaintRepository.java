package com.pazarsaffaf.complaint;

import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStatusOrderBySubmittedAtDesc(String status);

    List<Complaint> findByAssignedOfficer_IdOrderBySubmittedAtDesc(Long officerId);

    List<Complaint> findByStatusInOrderBySubmittedAtDesc(Collection<String> statuses);
}
